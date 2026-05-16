# Toonleer Community Translations

Community-maintained translation improvements for [Toonleer](https://toonleer.com) — a daily math game for kids.

At build time, Toonleer fetches this file and merges any improvements into the app. Your changes go live with the next deployment.

---

## How to contribute

1. **Fork** this repository
2. **Edit** `translations.json` — fix or improve translations in any language
3. **Open a Pull Request** — describe what you changed and why

You don't need to include every key. Only include the keys you're improving — missing keys fall back to the built-in translations.

---

## File format

`translations.json` contains all 25 supported languages. Each language is a key (ISO 639-1 code) mapping to an object of translation strings:

```json
{
  "sw": {
    "heroHeadline": "Je, unaweza kuhesabu njia yako ya kurudi?",
    "practice": "Zoezi"
  },
  "zu": {
    "heroHeadline": "Ungabaleka ngendlela yakho emuva?"
  }
}
```

You can improve one key in one language, or a whole language block — whatever you have time for.

---

## Supported languages

| Code | Language      | Code | Language    |
|------|---------------|------|-------------|
| `af` | Afrikaans     | `nl` | Nederlands  |
| `ar` | العربية        | `no` | Norsk       |
| `bn` | বাংলা          | `pl` | Polski      |
| `da` | Dansk         | `pt` | Português   |
| `de` | Deutsch       | `sv` | Svenska     |
| `en` | English       | `sw` | Kiswahili   |
| `es` | Español       | `tr` | Türkçe      |
| `fr` | Français      | `uk` | Українська  |
| `hi` | हिन्दी         | `ur` | اردو        |
| `id` | Bahasa Indonesia | `xh` | isiXhosa |
| `it` | Italiano      | `zh` | 中文        |
| `ja` | 日本語         | `zu` | isiZulu     |
| `ko` | 한국어         |      |             |

---

## Key reference

Below are all 142 translation keys grouped by section, with the English value and a description.

### Game UI

| Key | English | Description |
|-----|---------|-------------|
| `chooseYourDifficulty` | Choose your difficulty: | Difficulty selection screen label |
| `easy` | Easy | Easy difficulty mode name |
| `medium` | Medium | Medium difficulty mode name |
| `hard` | Hard | Hard difficulty mode name |
| `practice` | Practice | Practice mode name — NOT "be afraid", must mean "exercise/drill" |
| `perfect` | Perfect! | Shown when player answers with no mistakes |
| `rowsCompleted` | Rows Completed: | Stat label on results screen |
| `accuracy` | Accuracy: | Stat label on results screen |
| `time` | Time: | Stat label on results screen |
| `retry` | Retry | Button to play again |
| `nextToonleerIn` | Next Toonleer in: | Countdown label until next daily puzzle |
| `shareYourResults` | Challenge Someone! | Share button label |
| `copiedToClipboard` | Copied to Clipboard! | Feedback after copying share text |
| `recordsHeading` | Current Records | Heading for the records section |
| `recordsSubtitle` | Can you beat these records? | Subtitle under records heading |
| `recordsWorld` | World | World leaderboard label |
| `recordsNational` | National | National leaderboard label |
| `recordsRegional` | Regional | Regional leaderboard label |
| `recordsLocal` | Local | Local leaderboard label |

### Home page — Hero section

| Key | English | Description |
|-----|---------|-------------|
| `heroHeadline` | Can you calculate your way back? | Main headline — refers to calculating back to the starting number |
| `heroSubtitle` | Solve math operations against the clock to reach the starting number! | Hero subtitle |
| `todayChallengeExpiresIn` | Today's challenge expires in | Countdown label |
| `startToday` | Start Today | Short CTA button |
| `startTodaysChallenge` | Start Today's Challenge | Full CTA button |

### Home page — Why kids love it

| Key | English | Description |
|-----|---------|-------------|
| `whyKidsLove` | Why Kids Love Toonleer | Section heading |
| `feature1Title` | Daily Challenge | Feature card title |
| `feature1Body` | A new puzzle every day... | Feature card description |
| `feature2Title` | Beat the Clock | Feature card title |
| `feature2Body` | Race against time... | Feature card description |
| `feature3Title` | Track Progress | Feature card title |
| `feature3Body` | Watch your accuracy... | Feature card description |
| `feature4Title` | Multiple Difficulties | Feature card title |
| `feature4Body` | From easy to hard... | Feature card description |

### Home page — More than practice

| Key | English | Description |
|-----|---------|-------------|
| `moreThanPractice` | More Than Just Practice | Section heading |
| `itsAGame` | It's a Game | Subheading |
| `bullet1` – `bullet5` | (various) | Bullet points in this section |
| `midHeroHeadline` | Ready to master multiplication... | Mid-page CTA headline |
| `midHeroHeadlineGradient` | ...and division? | Gradient-coloured continuation of midHeroHeadline |
| `midHeroSubtitle` | Join thousands of students... | Mid-page CTA subtitle |
| `noSignupRequired` | No signup required | Small label near CTA |

### Home page — School section

| Key | English | Description |
|-----|---------|-------------|
| `schoolHeadline` | Give Your Students a Daily Math Boost | School section heading — "Give", NOT "Grab" |
| `schoolHeadlineFree` | — Free Forever | Appended to school headline |
| `schoolSubtitle` | Toonleer is free for educators... | School section intro |
| `schoolSubtitleLink` | No signup required. | Link/note within subtitle |
| `schoolFeature2Title` | Track Progress | Feature title |
| `schoolFeature2Body` | Students build a streak... | Feature description |
| `schoolFeature3Title` | Works Anywhere | Feature title |
| `schoolFeature3Body` | No app download needed... | Feature description |

### Home page — Affiliate section

| Key | English | Description |
|-----|---------|-------------|
| `affiliateHeadline` | Earn While You Teach | Affiliate section heading |
| `affiliateBody1` | Share Toonleer with your audience... | First paragraph |
| `affiliatePrintedGames` | printed games | Inline text (keep lowercase, fits in a sentence) |
| `affiliateBody2` | Perfect for teachers, bloggers... | Second paragraph |
| `becomeAPartner` | Become a Partner | CTA button label |

### Home page — Footer

| Key | English | Description |
|-----|---------|-------------|
| `finalCtaHeadline` | Start Your Math Journey Today | Final CTA section heading |
| `finalCtaSubtitle` | Join thousands of students... | Final CTA subtitle |
| `footerExplore` | Explore | Footer column heading |
| `footerPlay` | Play | Footer column heading |
| `footerHowTo` | How to Play | Footer link |
| `footerPrintable` | Printable Games | Footer link |
| `footerResources` | Resources | Footer column heading |
| `footerAbout` | About | Footer link |
| `footerWorkbook` | Workbook | Footer link |
| `footerAffiliates` | Affiliates | Footer link |
| `footerLegal` | Legal | Footer column heading |
| `footerTerms` | Terms of Service | Footer link |
| `footerPrivacy` | Privacy Policy | Footer link |
| `footerRights` | All rights reserved. | Copyright line |
| `footerMadeIn` | Made in | Precedes country name |
| `footerCountry` | South Africa | Country name (translate to local name) |

### Difficulty selection screen

| Key | English | Description |
|-----|---------|-------------|
| `journey` | Journey | Name for the timed difficulty modes — NOT "eternity/time" |
| `chooseNumberPractice` | Choose a number to practice | Practice mode subtitle |
| `back` | Back | Back/return button — NOT "forever/eternity" |

### Game-over — Low score titles (practice encouragement)

| Key | English | Description |
|-----|---------|-------------|
| `titleBetterLuck` | 🎉 Better Luck Next Time! | |
| `titleKeepTrying` | 👏 Keep Trying! | |
| `titleGettingThere` | ⭐ Getting There! | |
| `titleImproving` | 🚀 Improving! | |
| `titleMakingProgress` | 🎊 Making Progress! | |
| `titleNotBad` | 🏆 Not Bad! | |
| `titleHalfwayThere` | 🎉 Halfway There! | |
| `titleGreatEffort` | 👏 Great Effort! | |
| `titleAlmostPerfect` | ⭐ Almost Perfect! | |
| `titleSoClose` | 🚀 So Close! | |

### Game-over — High score titles (celebration)

| Key | English | Description |
|-----|---------|-------------|
| `titleWellDone` | 🎉 Well Done! | |
| `titleGreatPractice` | 👏 Great Practice! | |
| `titleExcellentWork` | ⭐ Excellent Work! | |
| `titleYouDidIt` | 🚀 You Did It! | |
| `titleFantastic` | 🎊 Fantastic! | |
| `titleAmazingPractice` | 🏆 Amazing Practice! | |

> Keep the emoji in titles — they are language-neutral and part of the visual design.

### Practice complete screen

| Key | English | Description |
|-----|---------|-------------|
| `practiceComplete` | Practice #{n} Complete! | `#{n}` is replaced with a number — keep it exactly as-is |
| `practiceBody` | You've completed practice number #{n}... | `#{n}` placeholder — keep it |
| `practiceAgain` | Practice Again | Button label |
| `tryDailyChallenge` | Try Daily Challenge | Button label |
| `shareToonleer` | Share Toonleer | Button label |
| `copiedShareFriends` | Copied! Share with friends | Feedback after copying |

### How-to slides (6 tutorial steps)

| Key | English | Description |
|-----|---------|-------------|
| `howto1Title` | The Goal | Slide 1 title |
| `howto1p1` – `howto1p4` | (paragraphs) | Slide 1 body paragraphs |
| `howto1p4strong` | starting number | Bold word within howto1p4 |
| `howto2Title` | Multiplication | Slide 2 title |
| `howto2p1` – `howto2p3` | (paragraphs) | Slide 2 body — includes math like `9 x 2 = 18` (keep math format) |
| `howto3Title` | The Carry | Slide 3 title — `carryWord` appears here |
| `howto3p1` – `howto3p3` | (paragraphs) | Slide 3 body |
| `howto4Title` | Division | Slide 4 title |
| `howto4p1` – `howto4p3` | (paragraphs) | Slide 4 body — includes math |
| `howto5Title` | The Remainder | Slide 5 title — `remainderWord` appears here |
| `howto5p1` – `howto5p3` | (paragraphs) | Slide 5 body |
| `howto6Title` | Scoring | Slide 6 title |
| `howto6p1`, `howto6p2` | (paragraphs) | Slide 6 body |
| `howto6colMode` | Mode | Table column header |
| `howto6colTime` | Time | Table column header |
| `howto6colStars` | Stars | Table column header |
| `howto6practiceTime` | Unlimited | Practice row — time value |
| `howto6practiceStars` | — | Practice row — no stars |
| `howto6easyTime` | 4 min | Easy difficulty time |
| `howto6easyStars` | ⭐ | Easy stars (keep emoji) |
| `howto6mediumTime` | 3 min | Medium difficulty time |
| `howto6mediumStars` | ⭐⭐ | Medium stars (keep emoji) |
| `howto6hardTime` | 2 min | Hard difficulty time |
| `howto6hardStars` | ⭐⭐⭐ | Hard stars (keep emoji) |

### Mathematical terms (critical — easy to mistranslate)

| Key | English | Description |
|-----|---------|-------------|
| `carryWord` | carry | The arithmetic "carry" — the 1 you write above when adding. Must mean "carry/transfer", NOT "a little/barely" |
| `remainderWord` | remainder | The leftover in division. Must mean "remainder/leftover", NOT unrelated words |

### Lock / upgrade screen

| Key | English | Description |
|-----|---------|-------------|
| `lockCompleteEasy` | Complete Easy first | Unlock requirement message |
| `lockCompleteMedium` | Complete Medium first | Unlock requirement message |
| `lockCompleteHard` | Complete Hard first | Unlock requirement message |
| `lockRequiresPro` | Upgrade to Pro to unlock Journey | Upgrade prompt |
| `lockDailyLimit` | Daily attempts used — come back tomorrow or upgrade to Pro | Limit reached message |
| `upgrade` | Upgrade | Upgrade button — must mean "to upgrade/level up", NOT "disappear" |

---

## Critical translation notes

A few keys have caused mistranslations in the past. Please take extra care:

- **`practice`**: must mean "exercise / drill / practice" — not fear, danger, or anything unrelated
- **`medium`**: must mean "middle / intermediate difficulty" — not "time" or "moment"
- **`back`**: a navigation button meaning "go back / return" — not "forever / eternity"
- **`upgrade`**: must mean "to upgrade / level up" — not "disappear / vanish"
- **`carryWord`**: the arithmetic carry concept — not "a little / rarely"
- **`schoolHeadline`**: starts with "Give Your Students..." — not "Grab your students..."
- **`#{n}` placeholders**: must be kept exactly as-is in `practiceComplete` and `practiceBody`
- **Math examples** in howto slides (`9 x 2 = 18`): keep the math format, only translate surrounding words
- **Emoji** in game-over titles: keep all emoji exactly as-is
- **"Toonleer"**: never translate the product name

---

## Questions?

Open an issue or start a discussion. We appreciate any improvement, no matter how small.
