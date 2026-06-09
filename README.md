# Toonleer Community Translations

Community-maintained translation improvements for [Toonleer](https://toonleer.com) — the educational math game designed to boost multiplication speed and mastery of times tables 2–9 and 11–99.

---

At build time, Toonleer fetches the per-language files and merges any improvements into the app. Your changes go live with the next deployment.

---

## How to contribute

1. **Fork** this repository
2. **Edit** the relevant file under `translations/` — fix or improve translations in any language
3. **Open a Pull Request** — describe what you changed and why

You don't need to include every key. Only include the keys you're improving — missing keys fall back to the built-in translations.

### From the command line

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/toonleer-translations.git
cd toonleer-translations

# Create a branch for your change
git checkout -b fix/swahili-practice-label

# Edit one language file, then commit
git add translations/sw.json
git commit -m "Fix Swahili practice label"

# Push your branch
git push -u origin fix/swahili-practice-label

# Open a pull request (requires GitHub CLI — https://cli.github.com)
gh pr create --title "Fix Swahili practice label" --body "Corrected practice key translation."
```

If you don't have the GitHub CLI, push the branch and GitHub will show a **"Compare & pull request"** button when you visit the repo.

---

## File format

Translations live in `translations/`, one file per language, named by ISO 639-1
code: `translations/en.json`, `translations/sw.json`, etc. `translations/langs.json`
lists the supported codes. `en.json` is the English reference — English is authored
in the app (`src/data/translations/index.js`) and synced here, so edit the other
languages.

Each `<lang>.json` maps translation keys to strings:

```json
{
  "heroHeadlineGradient": "calculate",
  "practice": "Practice"
}
```

You don't need every key — missing keys fall back to the built-in English baseline.

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

Below are all ~450 translation keys grouped by section, with the English value and a description.

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
| `helpUsTranslate` | Help us translate | Link/button prompting community translation contribution |

### Navigation

| Key | English | Description |
|-----|---------|-------------|
| `navPlay` | Play | Navbar link to the game |
| `navMyStats` | My Stats | Navbar link to stats page |
| `navLeaderboards` | Leaderboards | Navbar link to leaderboards (plural) |
| `navHowTo` | How To Complete a Toonleer | Navbar link to how-to page |
| `navBuyWorkbook` | Buy the Workbook | Navbar link to workbook purchase |
| `navAbout` | About the Toonleer | Navbar link to about page |
| `navProfile` | Profile | Navbar link to profile page |
| `navHome` | Toonleer Home | Navbar home link (screen-reader / aria label) |

### My Stats — stat labels

| Key | English | Description |
|-----|---------|-------------|
| `statsXP` | XP | Experience points label |
| `statsPlayed` | Played | Total games played label |
| `statsWinPercent` | Win % | Win percentage label |
| `statsCurrentStreak` | Current Streak | Current daily streak label |
| `statsMaxStreak` | Max Streak | All-time best streak label |
| `statsBestGamesHeading` | Best Games | Section heading for best game records |
| `statsPerformanceByDifficulty` | Performance by Difficulty | Section heading |
| `statsGameHistory` | Game History | Section heading |
| `statsEasyGames` | Easy Games | Easy difficulty game count label |
| `statsMediumGames` | Medium Games | Medium difficulty game count label |
| `statsHardGames` | Hard Games | Hard difficulty game count label |
| `statsBestGame` | Best {difficulty} Toonleer | Best game label — `{difficulty}` is replaced at runtime |
| `statsNoGame` | No Toonleer completed successfully. | Empty state for best game |
| `statsCompleted` | Completed | Game status: completed all 16 rows |
| `statsIncomplete` | Incomplete ({correct}/16) | Game status: did not finish — `{correct}` is replaced |
| `statsGamesLabel` | Games: | Stat sub-label |
| `statsPersonalBests` | Personal bests: | Stat sub-label |
| `statsWinRate` | Win Rate: | Stat sub-label |
| `statsAvgTime` | Avg Time: | Average time label |

### Achievements page

| Key | English | Description |
|-----|---------|-------------|
| `achievementsHeading` | Achievements | Page heading |
| `achievementsSubtitle` | Track your milestones and try to set Personal Best, School, City, Region, Country and World records! | Page subtitle |
| `achievementsError` | Error loading achievements | Error message when achievements fail to load |

### Leaderboards — table & member UI

| Key | English | Description |
|-----|---------|-------------|
| `lbPlayer` | Player | Table column header |
| `lbGames` | Games | Table column header |
| `lbPBs` | PBs | Table column header (Personal Bests abbreviation) |
| `lbAction` | Action | Table column header |
| `lbTotalStars` | Total Stars | Stat label |
| `lbSuccessRate` | Success Rate | Stat label |
| `lbAvgAccuracy` | Avg Accuracy | Stat label |
| `lbPersonalBests` | Personal Bests | Stat label |
| `lbWeeklyBreakdown` | Weekly Breakdown | Section heading |
| `lbVerified` | Verified | Member verification badge |
| `lbUnverified` | Unverified | Member verification badge |
| `lbInviteLink` | Invite Link | Label for the shareable invite link |
| `lbInviteCodeLabel` | Invite Code: | Label preceding the invite code |
| `lbCopied` | Copied! | Feedback after copying a code or link |
| `lbLeave` | Leave | Button to leave a leaderboard |
| `lbUnfollow` | Unfollow | Button to unfollow a leaderboard |
| `lbNoMembers` | No members found. | Empty state |
| `lbAdmin` | Admin | Role badge for leaderboard admin |
| `lbPro` | Pro | Role badge for Pro users |
| `lbYouSuffix` | (You) | Suffix appended to the current user's row |
| `lbLoad25More` | Load 25 more | Pagination button |
| `lbRemoveMember` | Remove member | Button/action label |
| `lbConfirmRemove` | Are you sure you want to remove {username} from {title}? They will need to re-join using the invite code. | Confirmation message — `{username}` and `{title}` are replaced |
| `lbCancel` | Cancel | Cancel button |
| `lbRemoveBtn` | Remove | Confirm remove button |
| `lbRemovingBtn` | Removing... | Loading state for remove |
| `lbLeaveLeaderboard` | Leave leaderboard | Dialog title |
| `lbConfirmLeave` | Are you sure you want to leave {title}? You can rejoin using the invite code. | Confirmation — `{title}` is replaced |
| `lbLeavingBtn` | Leaving... | Loading state for leave |
| `lbDeleteLeaderboard` | Delete Leaderboard | Dialog title |
| `lbDeleteWarning` | This action cannot be undone | Warning line in delete dialog |
| `lbDeleteBody` | Deleting this leaderboard will permanently remove it and kick all members. | Delete dialog body |
| `lbDeleteConfirm` | Type {title} to confirm | Instruction to type leaderboard name — `{title}` is replaced |
| `lbDeleteBtn` | Delete | Confirm delete button |
| `lbDeletingBtn` | Deleting... | Loading state for delete |
| `lbUnfollowLeaderboard` | Stop following leaderboard | Dialog title |
| `lbConfirmUnfollow` | Stop following {title}? | Confirmation — `{title}` is replaced |
| `lbUnfollowingBtn` | Unfollowing... | Loading state for unfollow |

### Leaderboards — types & discovery

| Key | English | Description |
|-----|---------|-------------|
| `lbSchool` | School | Leaderboard type name |
| `lbCompany` | Company | Leaderboard type name |
| `lbSocial` | Social Group | Leaderboard type name |
| `lbForTeachers` | For teachers and students. | Type description |
| `lbForCoworkers` | For coworkers and teams. | Type description |
| `lbForFollowers` | For your followers, community or subscribers. | Type description |
| `lbFriendsFamily` | Friends & Family | Friends & Family leaderboard label |
| `lbJoin` | Join | Short join button label |
| `lbJoinLeaderboard` | Join Leaderboard | Full join button label |
| `lbCreate` | Create | Short create button label |
| `lbCreateLeaderboard` | Create Leaderboard | Full create button label |
| `lbNoFriendsTitle` | No friends yet | Empty state heading for friends list |
| `lbNoFriendsDesc` | Add friends to compare scores! | Empty state description |
| `lbShareFriendLink` | Share your friend link | Section heading |
| `lbShareFriendDesc` | Anyone who opens your link can send you a friend request. | Description under friend link |
| `lbCopyLink` | Copy link | Button label |
| `lbAddFriend` | Add Friend | Button label |
| `lbUsernamePlaceholder` | Enter username... | Input placeholder for adding a friend by username |
| `lbEmailVerifRequired` | Email verification required | Alert heading |
| `lbEmailVerifBody` | You need a verified email to add friends. Please verify your email in your profile. | Alert body |
| `lbGoToProfile` | Go to profile | Link label |
| `lbRemoveFriend` | Remove Friend | Dialog title |
| `lbConfirmRemoveFriend` | Are you sure you want to remove {username} from your friends? | Confirmation — `{username}` is replaced |

### Leaderboards — join flow

| Key | English | Description |
|-----|---------|-------------|
| `lbJoinLeaderboardTitle` | Join a Leaderboard | Step heading |
| `lbAgeVerification` | Age Verification | Step heading |
| `lbPreviewLeaderboard` | Preview Leaderboard | Step heading |
| `lbEnterCodeDesc` | Enter the invite code or custom code to find a leaderboard. | Instruction text |
| `lbCodeFormat` | 4–10 characters, letters and numbers | Input hint |
| `lbLookingUp` | Looking up... | Loading state while searching |
| `lbFindLeaderboard` | Find Leaderboard | Submit button |
| `lbYourBirthdate` | Your date of birth, for age group | Label above birthdate fields |
| `lbYear` | Year | Year select label |
| `lbMonth` | Month | Month select label |
| `lbDay` | Day | Day select label |
| `lbTooOld` | You must be born in {year} or later to join this school. | Age restriction error — `{year}` is replaced |
| `lbAgeRestrictionDesc` | {name} is for players born in {year} or later (under {age} years old). If you are older, you can follow the leaderboard. | Age gate description — `{name}`, `{year}`, `{age}` replaced |
| `lbFollowing` | Following... | Loading state |
| `lbFollowInstead` | Follow instead | Button shown when too old to join |
| `lbContinue` | Continue | Continue button |
| `lbJoining` | Joining... | Loading state while joining |
| `lbBack` | Back | Back button in join flow |

### Leaderboards — create flow

| Key | English | Description |
|-----|---------|-------------|
| `lbChooseType` | Choose Type | Step heading |
| `lbYourLocation` | Your Location | Step heading |
| `lbExistingLeaderboards` | Existing Leaderboards | Section heading |
| `lbWhatKindLeaderboard` | What kind of leaderboard would you like to create? | Prompt text |
| `lbLocationDesc` | We'll show existing leaderboards near this location to avoid duplicates. | Hint text |
| `lbNoneNearYou` | No existing leaderboards found in your area. | Empty state |
| `lbExistNearYouDesc` | These leaderboards already exist near you. Join one, or create a new one. | Message when nearby leaderboards exist |
| `lbLoading` | Loading... | Generic loading state |
| `lbCreateNew` | Create New | Button to proceed with creating |
| `lbNameRequired` | Name is required | Validation error |
| `lbWebsiteOptional` | Website (optional) | Input label |
| `lbCreating` | Creating... | Loading state while creating |

### Profile page

| Key | English | Description |
|-----|---------|-------------|
| `profileTitle` | Profile | Page title |
| `profileFreeAccount` | Free Account | Account tier label |
| `profileFamilyProAnnual` | Family Pro (Annual) | Account tier label |
| `profileFamilyProMonthly` | Family Pro (Monthly) | Account tier label |
| `profileFamilyPro` | Family Pro | Account tier label |
| `profileIndividualProLifetime` | Individual Pro (Lifetime) | Account tier label |
| `profileIndividualProAnnual` | Individual Pro (Annual) | Account tier label |
| `profileIndividualProMonthly` | Individual Pro (Monthly) | Account tier label |
| `profileIndividualPro` | Individual Pro | Account tier label |
| `profileProReferral` | Pro (Referral) | Account tier label |
| `profilePro` | Pro | Short Pro badge label |
| `profileSchoolPro` | School Pro | Account tier label |
| `profileManageAccount` | Manage Account | Section/button label |
| `profileManagedByParent` | This profile is managed by your parent. You can change your profile picture below. | Notice for child accounts |
| `profileBirthday` | Birthday | Section heading |
| `profileBirthdayAgeGroup` | (used to calculate age group) | Sub-label under birthday heading |
| `profileNotSet` | Not set | Placeholder when a field has no value |
| `profileCreateYourSchool` | Create Your School | Section heading for teacher school creation |
| `profileVerifyEmailForSchool` | In order to create a school profile, please verify your email address below. | Instruction for teachers |
| `profileSchoolDescription` | Create a school profile to track your students' progress and manage leaderboards. | Description |
| `profileEmailVerification` | Email Verification | Section heading |
| `profileDataWarning` | Note: Your data is stored on this device only and will be lost if you clear your browser data. To save it to the cloud, verify your email address, so that you can log in with it later. | Data persistence warning |
| `profileLogInAnotherDevice` | Log in on another device | Section heading / link label |
| `profileQRDescription` | Save and verify your email so you can log in on a new device with an email code. QR login is for child accounts only. | Description under the QR / device login section |
| `profileLocation` | Location | Section heading |
| `profileRegionState` | Region / State | Label for region selector |
| `profileSearchRegion` | Search for your region... | Placeholder for region search input |
| `profileCity` | City | Label for city selector |
| `profileSearchCity` | Search for your city... | Placeholder for city search input |
| `profileSave` | Save | Save button label |
| `profileCancel` | Cancel | Cancel button label |
| `profileManageFamilyAccount` | Manage Family Account | Section heading |
| `profileChooseProPlan` | Choose a Pro plan — Individual, Family, or Early Bird lifetime access. | CTA description |
| `profileViewProPlans` | View Pro plans | CTA button |
| `profileActive` | Active | Badge shown on active plan |
| `profileLifetimeAccess` | Lifetime access — no recurring charges. | Lifetime plan description |
| `profileSubscriptionActive` | {plan} subscription active. All Pro features unlocked. | Active subscription notice — `{plan}` is replaced |
| `profilePlanAnnual` | Annual | Plan billing period label |
| `profilePlanMonthly` | Monthly | Plan billing period label |
| `profileAllProUnlocked` | All Pro features unlocked. | Status message |
| `profileOneTimePurchase` | This is a one-time purchase. No billing management needed. | Lifetime plan note |
| `profileManageSubscription` | Manage Subscription | Button to open billing portal |
| `profileGoToProfile` | Go to profile | Link label |
| `profileLoadingBilling` | Loading… | Loading state for billing portal |

### QR login (child accounts)

| Key | English | Description |
|-----|---------|-------------|
| `qrLogInAnotherDevice` | Log in on another device | Heading |
| `qrScanDescription` | Scan a QR code to log in as this profile on another device. | Description |
| `qrShowLogin` | Show login QR | Button to reveal QR code |
| `qrGenerating` | Generating… | Loading state while generating QR |
| `qrExpired` | QR code expired. | Expired state message |
| `qrRefresh` | Refresh QR | Button to regenerate expired QR |
| `qrExpiresIn` | Expires in {minutes}:{seconds} | Countdown — `{minutes}` and `{seconds}` are replaced |
| `qrCopyLink` | Copy link | Button to copy the QR login link |
| `qrCopied` | Copied! | Feedback after copying |

### Roles & Children

| Key | English | Description |
|-----|---------|-------------|
| `roleSelectPrompt` | Select your role... | Profile-type selector placeholder |
| `roleSelectHint` | Select an option to help us customize your experience | Hint text under selector |
| `roleStudent` | Student under 18 | Role option label |
| `roleStudentDesc` | I'm still in school and want to join my school leaderboard. | Role option description |
| `roleTeacher` | Teacher | Role option label |
| `roleTeacherDesc` | I want to manage a school profile and leaderboard. | Role option description |
| `roleParent` | Parent | Role option label |
| `roleParentDesc` | I will manage my children's accounts, on one device. | Role option description |
| `roleEnthusiast` | Maths Enthusiast | Role option label |
| `roleEnthusiastDesc` | I just want to challenge family, friends and followers. | Role option description |
| `childrenSection` | Children | Section heading for child accounts |
| `childAddButton` | Add Child | Button to add a child account |
| `childNoChildrenYet` | No children added yet. Add a child account so they can play with their own scores. | Empty state |
| `childQRHint` | To log a child in on a different device, scan the QR code, or open the link on their device. Link expires in 10 minutes. | Hint shown under child QR code |
| `childEditProfile` | Edit Child Profile | Edit dialog title |
| `childAddAccount` | Add Child Account | Add dialog title |
| `childChooseAvatar` | Choose Avatar | Section heading in child form |
| `childUsernameLabel` | Username | Label for username field in child form |
| `childUsernamePlaceholder` | e.g. emma_math | Placeholder for child username input |
| `childUsernameTaken` | Username already taken | Validation error |
| `childOptional` | (optional) | Inline label marking optional fields |
| `childYearOption` | Year | Year select placeholder |
| `childMonthOption` | Month | Month select placeholder |
| `childDayOption` | Day | Day select placeholder |
| `childSchoolCode` | School Code | Label for school code field |
| `childSchoolCodePlaceholder` | 4–10 char code | Placeholder for school code input |
| `childCurrentlyEnrolled` | Currently enrolled in a school | Label shown when child has a school |
| `childRemoveFromSchool` | Remove from school | Button to remove child from school |
| `childSaving` | Saving… | Loading state while saving changes |
| `childCreating` | Creating… | Loading state while creating account |
| `childSaveChanges` | Save Changes | Submit button for edit form |
| `childCreateAccount` | Create Account | Submit button for add form |
| `childDeleting` | Deleting… | Loading state while deleting |
| `childYesDelete` | Yes, delete | Confirm delete button |
| `childKeep` | Keep | Cancel delete button |
| `childDeleteProfile` | Delete Profile | Dialog title for child delete |
| `childEdit` | Edit | Edit button label on child card |
| `childSwitchTo` | Switch to | Button to switch active profile to a child |

### Profile forms — Username & Full Name

| Key | English | Description |
|-----|---------|-------------|
| `uiUsernameSection` | Username | Section heading |
| `uiFullNameSection` | Full Name | Section heading |
| `uiOptional` | (optional) | Inline label marking optional fields |
| `uiUsernameHint` | Username can only contain letters, numbers, and underscores (3-30 characters) | Input hint |
| `uiFullNameHint` | Optional - Your real name (up to 100 characters) | Input hint |
| `uiEnterUsername` | Enter username | Input placeholder |
| `uiEnterFullName` | Enter full name (optional) | Input placeholder |
| `uiUsernameRequired` | Username is required | Validation error |
| `uiUsernameMinLength` | Username must be at least 3 characters | Validation error |
| `uiUsernameMaxLength` | Username must be less than 30 characters | Validation error |
| `uiUsernamePattern` | Username can only contain letters, numbers, and underscores | Validation error |
| `uiFullNameMaxLength` | Full name must be less than 100 characters | Validation error |
| `uiUsernameTaken` | Username already taken | Server conflict error |
| `uiSaveUsernameFailed` | Failed to save username | Server error |
| `uiSaveFullNameFailed` | Failed to save full name | Server error |

### Profile forms — Birthdate & School

| Key | English | Description |
|-----|---------|-------------|
| `bdYear` | Year | Year select label |
| `bdMonth` | Month | Month select label |
| `bdDay` | Day | Day select label |
| `bdAgeGroupPrefix` | Age group:  | Label before the calculated age group |
| `bdSchoolSection` | School | Section heading |
| `bdSchoolDesc` | If your school has a Toonleer profile, enter the invite code you received from your teacher. Or ask them to create one! | Description |
| `bdSchoolCodeHint` | 6 characters using letters and numbers (e.g., ABC123) | Input hint |
| `bdSchoolCodePlaceholder` | ABC123 | Placeholder for school code input |
| `bdJoining` | Joining... | Loading state while joining school |
| `bdJoinSchool` | Join School | Submit button |
| `bdToastInvalidCode` | Please enter a valid 6-character invite code | Toast error message |
| `bdToastSetBirthdate` | Please set your birthdate before joining a school. We need this to group students by age. | Toast warning message |
| `bdToastJoinSuccess` | Successfully joined school! | Toast success message |
| `bdToastJoinFailed` | Failed to join school: {error} | Toast error — `{error}` is replaced with the error detail |

### Profile forms — Email verification

| Key | English | Description |
|-----|---------|-------------|
| `evEmailAddress` | Email Address | Field label |
| `evEmailOptional` | (optional, private) | Sub-label |
| `evEmailPlaceholder` | your@email.com | Input placeholder |
| `evLoginCode` | Login Code | Field label when in login mode |
| `evVerificationCode` | Verification Code | Field label when verifying |
| `evCodeHintLogin` | Enter the 6-digit login code sent to {email} | Hint — `{email}` is replaced |
| `evCodeHintVerify` | Enter the 6-digit verification code sent to {email} | Hint — `{email}` is replaced |
| `evSending` | Sending... | Loading state for send button |
| `evSendLoginCode` | Send Me a Login Code | Button label |
| `evLoggingIn` | Logging in... | Loading state for login button |
| `evVerifying` | Verifying... | Loading state for verify button |
| `evLogIn` | Log In | Button label |
| `evVerifyEmail` | Verify Email | Button label |
| `evResendCode` | Resend Code | Button to resend after cooldown |
| `evResendTimer` | Resend ({seconds}s) | Countdown while resend is cooling — `{seconds}` is replaced |
| `evChangeEmail` | Change email address | Link to go back and change email |
| `evEmailVerified` | Email Verified | Heading when already verified |
| `evEmailVerifiedSuccess` | Email Verified Successfully! | Success heading |
| `evEmailAlreadyRegistered` | Email Already Registered | Conflict heading |
| `evEmailAlreadyDesc` | This email is already registered to another account. | Conflict description |
| `evLogInWithEmail` | Log in with this email | Button shown on email conflict |
| `evTryDifferentEmail` | Try Different Email | Button to reset and try another address |
| `evInvalidEmail` | Please enter a valid email address | Validation error |
| `evTooManyRequests` | Too many requests. Please try again later. | Rate-limit error |
| `evSendFailed` | Failed to send verification code | Server error |
| `evNetworkError` | Network error. Please try again. | Network error |
| `evLoginTooManyRequests` | Too many login requests. Please try again later. | Rate-limit error for login flow |
| `evLoginSendFailed` | Failed to send login code | Server error for login flow |
| `evEnterCode` | Please enter the 6-digit code | Validation error |
| `evInvalidLoginCode` | Invalid login code | Server error for login code |
| `evInvalidVerificationCode` | Invalid verification code | Server error for verify code |

### MyStats — achievements list & filters

| Key | English | Description |
|-----|---------|-------------|
| `achNoAchievements` | No achievements yet | Empty state heading |
| `achEmptyStateDesc` | Complete games to earn achievements and set records! | Empty state description |
| `achFilters` | Filters | Filters section heading |
| `achAchievementType` | Achievement Type | Filter label |
| `achAllTypes` | All Types | Filter option (no type filter) |
| `achPersonalBest` | Personal Best | Achievement type option |
| `achSchoolRecords` | School Records | Achievement type option |
| `achCityRecords` | City Records | Achievement type option |
| `achRegionRecords` | Region Records | Achievement type option |
| `achCountryRecords` | Country Records | Achievement type option |
| `achWorldRecords` | World Records | Achievement type option |
| `achAllDifficulties` | All Difficulties | Filter option (no difficulty filter) |
| `achShowingOf` | Showing {shown} of {total} achievements | Filter summary — `{shown}` and `{total}` replaced |
| `achClearFilters` | Clear filters | Button to reset all filters |
| `achNoFiltersMatch` | No achievements match the selected filters. | Empty state when filters return nothing |
| `achShowingLimit` | Showing {limit} of {filtered} achievements | Truncation notice — `{limit}` and `{filtered}` replaced |

### MyStats — tabs & record progression

| Key | English | Description |
|-----|---------|-------------|
| `statsMyStatsTab` | My Stats | Tab label for personal stats |
| `statsSchoolsGroups` | Schools / Groups | Tab label for schools & groups stats |
| `statsCountriesTab` | Countries | Tab label for country leaderboard |
| `statsBeta` | beta | Badge shown next to new/beta tabs |
| `recordProgressionTitle` | Record Progression | Chart/section heading |
| `recordLevelLabel` | Level | Selector label (World / Country / City / School) |
| `recordDifficultyLabel` | Difficulty | Selector label |
| `levelWorld` | World | Level selector option |
| `levelCountry` | Country | Level selector option |
| `levelCity` | City | Level selector option |

### MyStats — country stats table

| Key | English | Description |
|-----|---------|-------------|
| `csRank` | Rank | Table column header |
| `csName` | Name | Table column header |
| `csGamesPlayed` | Games Played | Table column header |
| `csHardStars` | Hard Stars | Table column header |
| `csMediumStars` | Medium Stars | Table column header |
| `csEasyStars` | Easy Stars | Table column header |

### MyStats — group stats

| Key | English | Description |
|-----|---------|-------------|
| `gsComingSoon` | Coming soon! | Placeholder text |
| `gsJoinGroup` | Join a Group | Button/link label |
| `gsCreateGroup` | Create a Group | Button/link label |

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
- **`{placeholder}` variables** (curly-brace style): appear in many new keys (e.g. `lbConfirmRemove`, `bdToastJoinFailed`, `evCodeHintLogin`, `achShowingOf`). Keep `{username}`, `{title}`, `{email}`, `{shown}`, `{total}`, `{seconds}`, `{error}`, `{plan}`, `{year}`, `{age}`, `{name}`, `{limit}`, `{filtered}`, `{correct}`, `{difficulty}` exactly as-is — only translate the surrounding text.
- **Math examples** in howto slides (`9 x 2 = 18`): keep the math format, only translate surrounding words
- **Emoji** in game-over titles: keep all emoji exactly as-is
- **"Toonleer"**: never translate the product name

---

## Questions?

Open an issue or start a discussion. We appreciate any improvement, no matter how small.
