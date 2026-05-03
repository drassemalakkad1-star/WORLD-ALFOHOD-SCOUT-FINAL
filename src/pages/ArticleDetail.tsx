import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useParams, Link } from "wouter";
import { news } from "@/data/news";
import NotFound from "./not-found";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { 
  Share2, 
  Link as LinkIcon, 
  Clock, 
  Calendar, 
  Eye, 
  Heart, 
  Bookmark,
  MessageSquare,
  Send,
  Mail,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getNewsBySlug, urlFor } from "@/lib/sanityClient";



export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const { data: sanityArticle, isLoading } = useQuery({
    queryKey: ["news", slug],
    queryFn: () => getNewsBySlug(slug || ""),
    enabled: !!slug,
  });

  // Use sanity data if available, otherwise fallback to static data
  const article = useMemo(() => {
    if (sanityArticle) {
      return {
        ...sanityArticle,
        id: sanityArticle._id,
        image: sanityArticle.mainImage ? urlFor(sanityArticle.mainImage).url() : sanityArticle.gallery?.[0] ? urlFor(sanityArticle.gallery[0]).url() : "/placeholder-news.jpg",
        date: sanityArticle.eventDate || sanityArticle._createdAt,
        category: sanityArticle.category || "أخبار",
        excerpt: sanityArticle.excerpt || (sanityArticle.content ? sanityArticle.content.substring(0, 150) + "..." : ""),
        author: sanityArticle.author || { name: "فريق التحرير", avatarColor: "#9333ea", role: "محرر أخبار" },
        views: sanityArticle.views || 0,
        likes: sanityArticle.likes || 0,
        tags: sanityArticle.tags || [],
        readTime: sanityArticle.readTime || "٥ دقائق"
      };
    }
    return news.find(n => n.slug === slug);
  }, [sanityArticle, slug]);

  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!article) return <NotFound />;

  // Get related articles
  const relatedArticles = news
    .filter(n => n.category === article.category && n.id !== article.id)
    .slice(0, 3);

  const paragraphs = article.content.split('\n\n');
  // Extract pull quote from second paragraph if it exists, otherwise first
  const pullQuoteSrc = paragraphs.length > 1 ? paragraphs[1] : paragraphs[0];
  const pullQuote = pullQuoteSrc.split('.')[0] + '.';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط المقال إلى الحافظة بنجاح.",
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    toast({
      title: "تم إرسال التعليق",
      description: "شكراً لمشاركتك رأيك معنا. سيظهر تعليقك بعد المراجعة.",
    });
    setComment("");
  };

  return (
    <SiteLayout>
      {/* Article Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden min-h-[60vh] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent z-10" />
          <img loading="lazy" decoding="async"
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container relative z-20 mx-auto px-4 md:px-8 max-w-4xl pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2 text-white/80 text-sm font-medium mb-8">
              <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-white transition-colors">الأخبار</Link>
              <span>/</span>
              <Link href={`/news?category=${article.category}`} className="hover:text-white transition-colors">{article.category}</Link>
              <span>/</span>
              <span className="text-white truncate max-w-[200px]">{article.title}</span>
            </nav>

            <div className="flex gap-3 mb-6">
              <Badge className="bg-secondary hover:bg-secondary text-white font-bold border-none text-sm px-4 py-1">
                {article.category}
              </Badge>
              {article.breaking && (
                <Badge variant="destructive" className="animate-pulse font-bold text-sm px-4 py-1">
                  عاجل
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium mb-10 border-r-4 border-accent pr-6">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-8 border-t border-white/20">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg"
                  style={{ backgroundColor: article.author.avatarColor }}
                >
                  {article.author.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">{article.author.name}</div>
                  <div className="text-white/70 text-sm">{article.author.role}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString('ar-EG')} مشاهدة
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col lg:flex-row gap-12">
          
          {/* Left Sidebar (Desktop Sticky Share) */}
          <div className="hidden lg:block w-16 shrink-0 relative">
            <div className="sticky top-32 flex flex-col gap-4">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary transition-colors hover:shadow-md"><FaFacebook className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary transition-colors hover:shadow-md"><FaTwitter className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary transition-colors hover:shadow-md"><FaLinkedin className="h-5 w-5" /></Button>
              <div className="w-8 h-px bg-border/50 mx-auto my-2" />
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary transition-colors hover:shadow-md" onClick={handleCopyLink} title="نسخ الرابط"><LinkIcon className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Mobile Share Row */}
              <div className="flex lg:hidden gap-2 pb-8 mb-8 border-b border-border/50 justify-center">
                <Button variant="outline" size="icon" className="rounded-full"><FaFacebook className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full"><FaTwitter className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full"><FaLinkedin className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleCopyLink}><LinkIcon className="h-4 w-4" /></Button>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg md:prose-xl prose-p:leading-[1.9] max-w-none text-foreground prose-headings:font-black prose-headings:text-primary prose-a:text-secondary prose-a:no-underline hover:prose-a:underline">
                {paragraphs.map((paragraph, i) => {
                  // Insert pull quote after second paragraph
                  if (i === 2) {
                    return (
                      <div key={`pq-${i}`}>
                        <blockquote className="my-12 p-8 bg-secondary/5 rounded-2xl border-r-4 border-secondary relative overflow-hidden">
                          <div className="absolute top-4 left-4 text-9xl text-secondary/10 font-serif leading-none select-none">"</div>
                          <p className="text-2xl md:text-3xl font-bold text-primary italic leading-relaxed relative z-10 m-0">
                            "{pullQuote}"
                          </p>
                        </blockquote>
                        <p key={i} className="text-[18px]">{paragraph}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-[18px] mb-6">{paragraph}</p>;
                })}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-3 mt-16 pt-8 border-t border-border">
                <span className="font-bold text-muted-foreground ml-2">الوسوم:</span>
                {article.tags.map(tag => (
                  <Link key={tag} href={`/news?search=${tag}`}>
                    <Badge variant="outline" className="text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg border-border">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Reactions Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="flex gap-4">
                  <Button 
                    variant={liked ? "default" : "outline"} 
                    className={`gap-2 rounded-xl font-bold ${liked ? 'bg-rose-500 hover:bg-rose-600 border-none' : ''}`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'أعجبني' : 'إعجاب'} ({(article.likes + (liked ? 1 : 0)).toLocaleString('ar-EG')})
                  </Button>
                  <Button 
                    variant={saved ? "default" : "outline"} 
                    className={`gap-2 rounded-xl font-bold ${saved ? 'bg-primary hover:bg-primary/90 border-none' : ''}`}
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    {saved ? 'محفوظ' : 'حفظ'}
                  </Button>
                </div>
                <Button variant="outline" className="gap-2 rounded-xl font-bold" onClick={handleCopyLink}>
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </Button>
              </div>

              {/* Author Bio Card */}
              <div className="mt-16 p-8 bg-card rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                <div 
                  className="w-24 h-24 rounded-2xl text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0 rotate-3 hover:rotate-0 transition-transform"
                  style={{ backgroundColor: article.author.avatarColor }}
                >
                  {article.author.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="text-center md:text-right">
                  <h3 className="text-xl font-black text-primary mb-1">الكاتب: {article.author.name}</h3>
                  <p className="text-secondary font-bold text-sm mb-4">{article.author.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-lg">
                    عضو في فريق الإعلام لعالم الفهود الكشفي والإرشادي، متخصص في تغطية أخبار ومبادرات الشباب وإيصال أصواتهم إلى العالم.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary font-bold hover:text-secondary gap-1">
                    عرض جميع مقالات الكاتب <LinkIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-16 pt-16 border-t border-border">
                <h3 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-secondary" />
                  التعليقات (٣)
                </h3>
                
                <form onSubmit={handleSubmitComment} className="mb-10 bg-muted/20 p-6 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-4">أضف تعليقاً</h4>
                  <Textarea 
                    placeholder="شاركنا رأيك في هذا المقال..." 
                    className="min-h-[120px] mb-4 bg-background resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="gap-2 font-bold px-8 rounded-xl bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4 ml-1 rotate-180" />
                      نشر التعليق
                    </Button>
                  </div>
                </form>

                <div className="space-y-6">
                  {/* Mock Comments */}
                  {[
                    { name: "فاطمة علي", time: "منذ ساعتين", text: "مقال رائع جداً ومبادرة تستحق الدعم. فخورة بأنني جزء من هذه الحركة العظيمة.", color: "#4D006E" },
                    { name: "محمود حسن", time: "منذ ٥ ساعات", text: "التفاصيل المذكورة توضح حجم الجهد المبذول. أتمنى رؤية المزيد من هذه القصص الملهمة التي تعطينا الأمل.", color: "#0094B4" },
                    { name: "ريم أحمد", time: "منذ يوم واحد", text: "شكراً لفريق الإعلام على التغطية المتميزة. شاركت المقال مع جميع أصدقائي في فرقة الكشافة.", color: "#F5B041" }
                  ].map((c, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: c.color }}>
                        {c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.time}</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
          
          {/* Right Sidebar (RTL layout) / Bottom on mobile */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-10">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
                  <span className="w-3 h-3 rounded-sm bg-secondary"></span>
                  مقالات ذات صلة
                </h3>
                <div className="space-y-6">
                  {relatedArticles.map((relArticle) => (
                    <Link key={relArticle.id} href={`/news/${relArticle.slug}`}>
                      <div className="group cursor-pointer">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                          <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
                          <img loading="lazy" decoding="async" 
                            src={relArticle.image} 
                            alt={relArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="text-xs font-bold text-secondary mb-1">{relArticle.date}</div>
                        <h4 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {relArticle.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Mini */}
            <div className="bg-primary rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <Mail className="w-8 h-8 mx-auto mb-3 text-accent" />
              <h3 className="text-lg font-bold mb-2">النشرة الإخبارية</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                لا تفوت أي خبر جديد!
              </p>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast({ title: "تم الاشتراك" }); }}>
                <Input 
                  type="email" 
                  placeholder="بريدك الإلكتروني" 
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10 text-sm"
                />
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-10 text-sm">
                  اشتراك
                </Button>
              </form>
            </div>
          </div>
          
        </div>
      </section>
    </SiteLayout>
  );
}
