import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          AI-Powered Resume Analysis
        </div>

        <h1 className="font-serif text-6xl md:text-7xl text-[#1a1a1a] leading-tight mb-8 max-w-3xl">
          Know exactly how well your resume <span className="italic text-amber-700">fits the job.</span>
        </h1>

        <p className="text-stone-500 text-lg max-w-xl mb-12 leading-relaxed">
          Upload your resume and paste a job description. Get a match score,
          skill gap analysis, and AI-powered suggestions — in seconds.
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="bg-[#1a1a1a] hover:bg-stone-800 text-white px-7 py-3.5 rounded-full font-medium transition text-sm"
          >
            Analyze My Resume →
          </Link>
          <Link
            to="/history"
            className="text-stone-500 hover:text-stone-800 text-sm font-medium transition px-4 py-3.5"
          >
            View History
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-8">
        <div className="border-t border-stone-200" />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            number: '01',
            title: 'Resume Parsing',
            desc: 'Upload your PDF and we extract all the relevant content automatically using intelligent parsing.',
          },
          {
            number: '02',
            title: 'AI Match Score',
            desc: 'Get a 0–100 score showing how well your resume fits the job, powered by state-of-the-art LLMs.',
          },
          {
            number: '03',
            title: 'Skill Gap Analysis',
            desc: 'See exactly which skills are missing and get tailored suggestions to strengthen your application.',
          },
        ].map((f) => (
          <div key={f.number} className="group">
            <p className="text-amber-600 text-xs font-semibold tracking-widest mb-4">{f.number}</p>
            <h3 className="text-[#1a1a1a] font-semibold text-lg mb-3">{f.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a1a] mx-8 mb-16 rounded-3xl px-12 py-16 max-w-5xl md:mx-auto text-center">
        <h2 className="font-serif text-4xl text-white mb-4 italic">Ready to land your dream job?</h2>
        <p className="text-stone-400 mb-8 text-sm">Free to use. No credit card required.</p>
        <Link
          to="/dashboard"
          className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-3.5 rounded-full font-medium transition text-sm inline-block"
        >
          Get Started Free →
        </Link>
      </section>

    </div>
  )
}

export default Home