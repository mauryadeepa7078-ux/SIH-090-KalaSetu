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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wide font-sans">
          <Users className="w-3.5 h-3.5" />
          <span>Artisan Peer Network & Guild Forum</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
          {t('navCommunity')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
          Connect with fellow artisans across Dilli Haat, Surajkund Mela, and Shilp Samagam exhibitions. Share techniques, collaborative bulk orders, and heritage stories.
        </p>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {communityPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-4">
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm" />
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-white font-serif">{post.author}</h4>
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 dark:text-stone-400 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>{post.cluster}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium font-sans">{post.time}</span>
            </div>

            {/* Post Content */}
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-hindi">
              {post.content}
            </p>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-inner">
              <img src={post.craftImg} alt="Craft post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 font-bold font-sans">
              <div className="flex items-center space-x-5">
                <button className="flex items-center space-x-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{post.likes} Appreciations</span>
                </button>
                <button className="flex items-center space-x-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments} Comments</span>
                </button>
              </div>

              <button className="flex items-center space-x-1 hover:text-stone-900 dark:hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share Story</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
