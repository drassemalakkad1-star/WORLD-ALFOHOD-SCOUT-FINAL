import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, HandMetal, Eye, Ear, Users, CheckCircle } from "lucide-react";

export function PeopleOfDetermination() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const features = [
    {
      icon: HandMetal,
      title: t('home.peopleOfDetermination.features.sign.title'),
      desc: t('home.peopleOfDetermination.features.sign.desc'),
    },
    {
      icon: Eye,
      title: t('home.peopleOfDetermination.features.visual.title'),
      desc: t('home.peopleOfDetermination.features.visual.desc'),
    },
    {
      icon: Ear,
      title: t('home.peopleOfDetermination.features.hearing.title'),
      desc: t('home.peopleOfDetermination.features.hearing.desc'),
    },
    {
      icon: Users,
      title: t('home.peopleOfDetermination.features.teams.title'),
      desc: t('home.peopleOfDetermination.features.teams.desc'),
    },
  ];

  const signLanguageWords = [
    { ar: t('home.peopleOfDetermination.words.hello'), emoji: "👋" },
    { ar: t('home.peopleOfDetermination.words.love'), emoji: "🤟" },
    { ar: t('home.peopleOfDetermination.words.yes'), emoji: "👍" },
    { ar: t('home.peopleOfDetermination.words.scout'), emoji: "✌️" },
    { ar: t('home.peopleOfDetermination.words.fine'), emoji: "👌" },
    { ar: t('home.peopleOfDetermination.words.thanks'), emoji: "🙏" },
  ];

  const stats = [
    { num: "+200", label: t('home.peopleOfDetermination.stats.scouts'), icon: "🏅" },
    { num: "100%", label: t('home.peopleOfDetermination.stats.inclusive'), icon: "♿" },
    { num: "+50", label: t('home.peopleOfDetermination.stats.translators'), icon: "🤟" },
    { num: "+15", label: t('home.peopleOfDetermination.stats.programs'), icon: "📋" },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white" aria-label={t('home.peopleOfDetermination.title1')}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/10 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Heart className="h-5 w-5 text-primary fill-primary/30" />
            <span className="font-bold text-primary text-sm tracking-wide">{t('home.peopleOfDetermination.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
            {t('home.peopleOfDetermination.title1')} <span className="text-secondary">{t('home.peopleOfDetermination.title2')}</span>
            <br />
            <span className="text-3xl md:text-5xl">{t('home.peopleOfDetermination.title3')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            {t('home.peopleOfDetermination.subtitle')}
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="rounded-3xl overflow-hidden shadow-2xl border border-primary/10 mb-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Sign Language showcase */}
            <div className="bg-primary p-10 md:p-14 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                    🤟
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{t('home.peopleOfDetermination.signLanguageTitle')}</h3>
                    <p className="text-white/70 font-medium text-sm">{t('home.peopleOfDetermination.signLanguageSubtitle')}</p>
                  </div>
                </div>
                <p className="text-white/85 text-lg leading-relaxed mb-10 font-medium">
                  {t('home.peopleOfDetermination.signLanguageDesc')}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {signLanguageWords.map((word) => (
                    <div
                      key={word.ar}
                      className="bg-white/10 hover:bg-white/20 transition-colors rounded-2xl p-4 text-center cursor-default"
                    >
                      <div className="text-4xl mb-2">{word.emoji}</div>
                      <div className="font-bold text-sm text-white/90">{word.ar}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-white/20">
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
                  <span className="font-medium text-sm">{t('home.peopleOfDetermination.signLanguageCertified')}</span>
                </div>
              </div>
            </div>

            {/* Right: Commitment details */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-10 md:p-14 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-primary mb-4">
                  {t('home.peopleOfDetermination.commitmentTitle')}
                </h3>
                <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                  {t('home.peopleOfDetermination.commitmentDesc')}
                </p>
                <div className="space-y-5">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-primary/10 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">{f.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-primary/10">
                <Link href="/get-involved">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full group shadow-lg hover:shadow-xl transition-all">
                    {t('home.peopleOfDetermination.cta')}
                    {isRtl ? (
                      <ArrowLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-primary/10 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-black text-primary mb-1">{stat.num}</div>
              <div className="text-sm font-semibold text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
