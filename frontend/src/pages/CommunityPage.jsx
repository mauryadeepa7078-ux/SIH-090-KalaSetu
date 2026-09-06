import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Sparkles, Heart, MessageCircle, Share2, MapPin, Award } from 'lucide-react';

export const CommunityPage = () => {
  const { products, t, lang, setActiveTab, setSelectedProduct } = useApp();

  const communityPosts = [
    {
      id: 1,
      author: 'Master Weaver Ram Das',
      cluster: 'Varanasi Weavers SHG, Uttar Pradesh',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      time: '2 hours ago',
      content: 'Just completed 25 Kadwa Zari sarees for the upcoming Shilp Samagam 2026! Using the KalaSetu AI Photo Studio made our e-commerce listings look 10x more premium. Thank you MoSJE!',
      craftImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      likes: 48,
      comments: 12
    },
    {
      id: 2,
      author: 'Sita Devi & Mithila Collective',
      cluster: 'Madhubani Artisan Guild, Bihar',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      time: 'Yesterday',
      content: 'We received a bulk inquiry from Central Cottage Industries Emporium for 300 natural dye Mithila paintings! Collaboration with fellow tribal artisans is growing.',
      craftImg: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      likes: 92,
      comments: 24
    },
    {
      id: 3,
      author: 'Budhram Baghel',
      cluster: 'Bastar Dokra Metalcraft, Chhattisgarh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      time: '2 days ago',
      content: 'Preserving our 4000-year-old lost-wax bell metal casting. The voice-to-catalog feature allows us to describe the heritage story in our regional dialect without needing English typing skills.',
      craftImg: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
      likes: 64,
      comments: 18
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <Users className="w-3.5 h-3.5 text-orange-600" />
          <span>Artisan Peer Network & Inspiration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-hindi">
          {t('navCommunity')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Connect with fellow artisans across Dilli Haat, Surajkund Mela, and Shilp Samagam exhibitions. Share techniques, collaborative bulk orders, and heritage stories.
        </p>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {communityPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={post.avatar} alt={post.author} className="w-11 h-11 rounded-full object-cover border-2 border-orange-500" />
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{post.author}</h4>
                  <div className="flex items-center space-x-1 text-xs text-stone-500">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    <span>{post.cluster}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-stone-400 font-medium">{post.time}</span>
            </div>

            {/* Post Content */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-hindi">
              {post.content}
            </p>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-200">
              <img src={post.craftImg} alt="Craft post" className="w-full h-full object-cover" />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500 font-semibold">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1.5 hover:text-red-600 transition-colors">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>{post.likes} Appreciations</span>
                </button>
                <button className="flex items-center space-x-1.5 hover:text-orange-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments} Comments</span>
                </button>
              </div>

              <button className="flex items-center space-x-1 hover:text-stone-900 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
