import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from backend.app.models.schemas import PricingCalculationRequest, PriceBreakdown
from backend.app.config import DATA_DIR

DATASET_PATH = DATA_DIR / "pricing_dataset.csv"

class CraftPricingEngine:
    def __init__(self):
        self.model = None
        self.category_averages = {}
        self._train_model()

    def _train_model(self):
        try:
            df = pd.read_csv(DATASET_PATH)
            
            # Map skill and dimensions to numeric
            skill_map = {"Apprentice": 1, "Skilled": 2, "Master Artisan": 3}
            dim_map = {"Small": 1, "Medium": 2, "Large": 3}
            
            # Preprocessing categorical & numeric features
            categorical_features = ['category', 'material_type']
            numeric_features = ['material_cost', 'hours_spent', 'skill_level_score', 'dimensions_score', 'is_gi_tagged']
            
            preprocessor = ColumnTransformer(
                transformers=[
                    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
                    ('num', 'passthrough', numeric_features)
                ]
            )
            
            self.model = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('regressor', Ridge(alpha=1.0))
            ])
            
            X = df[['category', 'material_type', 'material_cost', 'hours_spent', 'skill_level_score', 'dimensions_score', 'is_gi_tagged']]
            y = df['market_price']
            
            self.model.fit(X, y)
            
            # Calculate category benchmarks
            self.category_averages = df.groupby('category')['market_price'].mean().to_dict()
            print("[OK] Craft Pricing Scikit-Learn Regression model initialized & fitted successfully.")
        except Exception as e:
            print(f"[WARN] Error training pricing model: {e}. Fallback heuristics enabled.")

    def calculate_price(self, req: PricingCalculationRequest) -> PriceBreakdown:
        skill_score = {"Apprentice": 1, "Skilled": 2, "Master Artisan": 3}.get(req.skill_level, 2)
        dim_score = {"Small": 1, "Medium": 2, "Large": 3}.get(req.dimensions, 2)
        gi_val = 1 if req.is_gi_tagged else 0

        # Heuristic wage rate per hour based on artisan skill level
        hourly_rate = {1: 60.0, 2: 95.0, 3: 140.0}.get(skill_score, 95.0)
        labor_cost = round(req.hours_spent * hourly_rate, 2)
        material_cost = float(req.material_cost)
        base_production_cost = material_cost + labor_cost

        # Predict with ML model if available
        predicted_market_price = None
        if self.model:
            try:
                input_df = pd.DataFrame([{
                    'category': req.category,
                    'material_type': req.material_type,
                    'material_cost': material_cost,
                    'hours_spent': req.hours_spent,
                    'skill_level_score': skill_score,
                    'dimensions_score': dim_score,
                    'is_gi_tagged': gi_val
                }])
                pred = self.model.predict(input_df)[0]
                predicted_market_price = max(base_production_cost * 1.15, float(pred))
            except Exception as e:
                print(f"ML prediction fallback: {e}")

        # Benchmark reference
        cat_avg = self.category_averages.get(req.category, base_production_cost * 1.4)

        if predicted_market_price is None:
            # Fallback calculation
            gi_bonus = 1.25 if req.is_gi_tagged else 1.0
            predicted_market_price = (base_production_cost * 1.35) * gi_bonus

        # Calibrate recommended, min, and max
        recommended_price = round(predicted_market_price, -1) # round to nearest 10
        min_price = round(max(base_production_cost * 1.10, recommended_price * 0.82), -1)
        max_price = round(recommended_price * 1.28, -1)
        
        heritage_margin = round(recommended_price - base_production_cost, 2)
        if heritage_margin < 0:
            heritage_margin = round(recommended_price * 0.25, 2)

        # Bilingual explainable breakdowns
        gi_text_en = " + 20% GI Heritage Premium" if req.is_gi_tagged else ""
        gi_text_hi = " + 20% जीआई विरासत प्रीमियम" if req.is_gi_tagged else ""

        explanation_en = (
            f"Based on Raw Material (₹{material_cost}) + {req.hours_spent}hrs {req.skill_level} Labor (₹{labor_cost}) "
            f"+ Fair Profit Margin (₹{heritage_margin}){gi_text_en}. Market benchmark for {req.category} is ~₹{round(cat_avg)}."
        )

        explanation_hi = (
            f"कच्चा माल (₹{material_cost}) + {req.hours_spent} घंटे {req.skill_level} श्रम (₹{labor_cost}) "
            f"+ उचित लाभ मार्जिन (₹{heritage_margin}){gi_text_hi} पर आधारित। {req.category} का बाजार औसत ~₹{round(cat_avg)} है।"
        )

        return PriceBreakdown(
            min_price=min_price,
            recommended_price=recommended_price,
            max_price=max_price,
            material_cost=material_cost,
            labor_cost=labor_cost,
            heritage_margin=heritage_margin,
            platform_avg=round(cat_avg, 2),
            explanation_en=explanation_en,
            explanation_hi=explanation_hi
        )

pricing_engine = CraftPricingEngine()
