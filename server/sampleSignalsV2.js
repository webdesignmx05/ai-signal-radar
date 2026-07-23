export const sampleSignalsV2 = [
  {
    request_id: "sample-v2-001",
    topic: "AI for creativity, music and media",
    request_type: "A practical step-by-step plan",
    business_question:
      "How should I promote a web-based comic series, offer the first season free, and introduce paid membership for later episodes?",
    match_status: "strong_match",
    confidence_score: 89,
    answer_type: "practical_plan",
    direct_answer:
      "Use the free first season to build trust, establish a predictable release schedule, and collect email subscribers before asking readers to pay. Introduce the membership before the free season ends, and make the paid value clear through early access, bonus artwork, creator notes, or later episodes.",
    action_steps_json: JSON.stringify([
      "Define the comic's audience and one-sentence hook.",
      "Publish on a predictable weekly or biweekly schedule.",
      "Turn panels into reusable social previews and behind-the-scenes posts.",
      "Build an email list before introducing paid access.",
      "Offer membership benefits without hiding too much of the story from new readers."
    ]),
    quick_win:
      "Create one landing page with the comic's hook, first episode, release schedule, and email signup.",
    monetization_note:
      "Keep season one free as the discovery product, then offer early access, bonus art, creator notes, voting, or later webisodes through a modest membership.",
    ai_opportunity:
      "AI can help draft social-post variations, organize the release calendar, summarize analytics, and prepare accessibility descriptions while you keep final creative control.",
    risk_note:
      "Charging too early or locking away too much of the story can prevent new readers from becoming invested.",
    sources_json: JSON.stringify([
      {
        title: "Example creator membership guide",
        url: "https://example.com/creator-membership-guide",
        relevance_score: 0.91
      },
      {
        title: "Example audience-building guide for webcomics",
        url: "https://example.com/webcomic-audience-guide",
        relevance_score: 0.86
      }
    ]),
    created_at: "2026-07-22T20:30:00Z"
  }
];
