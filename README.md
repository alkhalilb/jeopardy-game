# 🎮 Jeopardy Game Web App

A fully-featured, real-time multiplayer Jeopardy game built with React and Firebase. Perfect for classrooms, corporate training, game nights, and virtual events!

## ✨ What Makes This Special?

- **⚡ Real-time Multiplayer**: Everything syncs instantly across all devices
- **🎨 Visual Feedback**: Glowing borders show buzz status (red=closed, green=open)
- **📱 Mobile First**: Large buttons and responsive design for phones/tablets
- **🎯 Smart Scoring**: Automatic point calculation with incorrect answer tracking
- **🔒 Fair Play**: Teams that answer incorrectly can't buzz again on same question
- **🎭 Three Views**: Instructor control, student play, and audience presentation
- **🎲 Full Jeopardy Rules**: Daily Doubles, Final Jeopardy, and team consensus
- **📂 Easy Setup**: Upload custom game files in minutes
- **🏆 Winners Screen**: Dramatic game ending display on all views
- **🔐 Admin Panel**: Password-protected database management
- **📱 QR Code**: Generated for easy student access
- **📖 Interactive Instructions**: Click "How to Use" on the home page for detailed guides
- **🛠️ Template Creator Tool**: Visual editor to create game files without manual formatting

## 🎯 Key Features

### Game Board
- **Adaptive Layout**: Board automatically adjusts to 3-8 categories
- **Horizontal Scrolling**: When many categories are present, the board scrolls horizontally while maintaining the classic Jeopardy grid format
- **Responsive Design**: Optimized column widths based on category count for best viewing experience
- **Mobile-Friendly**: Touch-optimized scrolling on mobile devices

### Instructor Interface
- **Custom Game IDs**: Create your own memorable Game ID or let the system generate one
- **Easy File Upload**: Upload custom Jeopardy files (.txt or .csv)
- **Template Download**: Download a pre-filled template directly from the instructor login page
- **Full Game Control**:
  - Select questions to display
  - Manual buzz control (open/close buzzes)
  - Mark answers as correct/incorrect
  - Close questions without scoring
  - Leave game (automatically deletes session)
- **Real-time Score Tracking**: Live updates for all teams
- **Daily Doubles**:
  - Select which team answers
  - View team wager confirmations in real-time
  - Reveal question when ready
  - Immediate correct/incorrect buttons (no buzzes)
- **Final Jeopardy**:
  - View all team answers (hidden from students/audience)
  - Reveal answers one by one in any order
  - Visual feedback shows which scoring decision was made
  - Automatic winner calculation and game ending

### Student Interface
- **Team-Based Gameplay**: Multiple students per team
- **Team Switching**: Students can change teams mid-game with the "Change Team" button
  - Teams with no members are automatically deleted
  - Wagers and answers are reset when switching teams
- **Large Buzz Button**: 200px circular button optimized for mobile
- **Visual Feedback System**:
  - 🔴 Red glowing border = Buzzes CLOSED
  - 🟢 Green glowing border = Buzzes OPEN
  - Crossed-out button when unable to buzz
- **Smart Buzz Protection**: Teams that answer incorrectly can't buzz again on same question
- **Race Condition Prevention**: Firebase transactions ensure only the first person to buzz gets credited (no flickering between players)
- **Daily Double Wagering**:
  - Team consensus required
  - Auto-populate wagers when teammate confirms
  - Change wager button before reveal
  - Max wager = higher of team score or $1000
- **Final Jeopardy**:
  - Written answer submission with team consensus
  - Auto-populate answers when teammate confirms
  - Change answer button before instructor reveals
  - See winning announcement when game ends
- **Mobile Responsive**: Optimized for phones and tablets

### Presentation View
- **Audience Display**: Perfect for projectors or streaming
- **Visual Status Indicators**: Red/green borders for buzz status (Daily Doubles have no borders)
- **Real-time Updates**: Syncs instantly with game state
- **Clean Interface**: Shows board, scores, and current question
- **Final Jeopardy**: Displays revealed answers as instructor reveals them
- **Winners Screen**: Large, dramatic display with final scores and winner announcement

### Administrator Panel
- **Password Protected**: Secure access (password: "Feinberg123")
- **Database Management**: Delete all games with one click
- **Clean Slate**: Perfect for resetting between classes or events

## 🎮 Game Rules & Flow

### Correct Answer ✅
- Points added to team score
- Question closes automatically
- Game returns to board

### Incorrect Answer ❌
- Points subtracted from team score
- **Team is locked out** from buzzing again on that question
- Buzzes automatically reopen for other teams
- Other teams can continue attempting

### Daily Doubles 💰
- "DAILY DOUBLE!" displayed before question reveal
- **All team scores displayed prominently on all views** for strategic wagering
- Instructor selects which team will answer
- Only selected team sees wager input
- Team members must agree on wager amount (auto-populate + confirmation)
- Maximum wager = higher of team's current score or $1000
- Instructor reveals question when team confirms wager
- **No buzzes** - instructor immediately marks correct/incorrect with proper wager amounts
- Question closes after scoring (no other teams can attempt)

### Final Jeopardy 🏆
- All teams submit wagers with team consensus
- Category displayed before wagering
- Question revealed after wagers submitted
- **Teams type and submit written answers** with team consensus
- Answers auto-populate to teammates for confirmation
- Instructor views all submitted answers (private)
- Instructor reveals answers one by one in chosen order
- Visual feedback shows which scoring decision was made
- Game automatically calculates winners and displays winners screen
- Winners screen appears on all views (instructor, student, presentation)

## 🎓 Perfect For

- **Education**: Review sessions, test prep, vocabulary practice
- **Corporate Training**: Onboarding, compliance training, team building
- **Events**: Trivia nights, fundraisers, competitions
- **Virtual Learning**: Remote classrooms, online meetings
- **Game Nights**: Family fun, party games, social gatherings

## 🚀 Quick Start Guide

**Live App:** https://jeopardy-sooty.vercel.app

### For Instructors (Game Host)
1. Open the app and click **"Instructor"**
2. (Optional) Click **"Download Template"** to get a pre-filled example file
3. (Optional) Enter a custom Game ID, or leave blank for random
4. Upload your Jeopardy file (`.txt` or `.csv`)
5. Share the Game ID with your students
6. Click questions to play, control buzzes, and score answers!

### For Students (Players)
1. Open the app and click **"Student"**
2. Enter your name, team name, and the Game ID
3. Wait for questions to appear
4. Watch for the **green glowing border** = buzzes are OPEN!
5. Hit the big red BUZZ button to answer

### For Presentation (Audience View)
1. Open the app and click **"Presentation View"**
2. Enter the Game ID
3. Project this screen for the audience
4. Automatically updates with the game in real-time

## 💻 Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Click "Create Database"
   - Start in **test mode** (or production mode with security rules)
   - Choose a location

4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon `</>` to create a web app
   - Copy the `firebaseConfig` object

5. Open `src/firebase.js` and replace the placeholder values with your actual Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyA...",  // Your actual API key
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```

**Note:** Firebase client credentials are safe to include in your code - they identify your project but don't provide access. Security is managed through Firebase Security Rules.

### 2. Install and Run

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`. Or use the live version at https://jeopardy-sooty.vercel.app

## Creating a Jeopardy File

### 📖 For Game Creators: Start Here!

**New to creating games?**
1. **Click "Download Template"** on the instructor login page to get a working example
2. Edit the template with your own questions and answers
3. Upload and play!

**Need more help?** Read **`HOW_TO_CREATE_GAME_FILES.md`** - A beginner-friendly guide with examples!

### 📁 Available Resources

**Templates (choose one):**
- `JEOPARDY_TEMPLATE.txt` - Tab-separated template (recommended)
- `JEOPARDY_TEMPLATE.csv` - Comma-separated template

**Documentation:**
- `HOW_TO_CREATE_GAME_FILES.md` - **Start here!** User-friendly guide
- `FILE_FORMAT_GUIDE.md` - Technical format specification
- `FILE_CHECKLIST.md` - Pre-upload verification checklist
- `sample-jeopardy.txt` - Working example with Final Jeopardy

**Quick Start:** Open a template, replace the placeholders, mark your Daily Doubles, and upload!

### Option 1: Template Creator Tool (NEW! 🛠️)

Use the interactive **Template Creator** accessible from the home page:
1. Click "🛠️ Template Creator (Beta)" button
2. Choose number of categories (3-8)
3. Name your categories
4. Fill in questions and answers for each value ($200-$1000)
5. Mark Daily Doubles by checking the "DD" box
6. Optionally add Final Jeopardy
7. Click "📥 Download Template" to get your game file
8. Upload it when creating a game as Instructor

**Benefits:** No formatting required, visual editor, instant feedback on Daily Double count

### Option 2: Manual File Format

The app accepts `.txt` (tab-separated) or `.csv` (comma-separated) files.

**Standard Game Structure:**
- 3-8 categories (flexible - choose what works for you!)
- 5 questions per category
- Values: $200, $400, $600, $800, $1000
- 1-3 Daily Doubles (mark with `true` in last field)
- Optional Final Jeopardy
- **Responsive board layout**: Automatically scrolls horizontally when needed to maintain proper formatting with any number of categories

**Line 1 - Categories** (tab or comma separated):
```
Science	History	Literature	Geography	Sports	Pop Culture
```

**Lines 2-31 - Questions** (5 fields per line):
```
Category	Value	Question	Answer	isDailyDouble
```

**Daily Double Example** (set last field to `true`):
```
Science	800	The study of earthquakes	What is Seismology	true
```

**Optional Final Jeopardy** (add at end of file):
```
FINAL JEOPARDY
Category	Question	Answer
```

Example:
```
FINAL JEOPARDY
U.S. Presidents	This president was the first to live in the White House	Who is John Adams
```

### Important Notes

- **Tab-separated (.txt):** Use TAB key between fields
- **Comma-separated (.csv):** Use commas between fields
- Don't mix tabs and commas!
- Must have 3-8 categories total
- Category names in questions must exactly match Line 1
- Each category needs exactly 5 questions
- Set isDailyDouble to `true` or `false` (1-3 recommended)

See `FILE_FORMAT_GUIDE.md` for detailed instructions and troubleshooting.

## 📖 Detailed Gameplay Instructions

### Instructor Controls

**Starting a Game:**
1. Create/enter a custom Game ID (optional) or use auto-generated ID
2. Upload your Jeopardy file
3. Share the Game ID with students
4. Wait for students to join (you'll see them in the scores)

**During Questions:**
1. Click any unplayed question ($200-$1000)
2. **Read the question out loud** to all players
3. Click **"Open Buzzes"** when ready for answers
4. Screen borders turn **green** for all players = they can buzz
5. When someone buzzes in, you'll see their name displayed
6. Mark their answer as:
   - ✅ **Correct** → Points added, question closes
   - ❌ **Incorrect** → Points subtracted, buzzes reopen for other teams
7. **Note:** Teams that answer incorrectly are locked out of that question

**Other Controls:**
- **Show Answer**: Reveal the answer without closing question
- **Close Buzzes**: Stop accepting new buzzes
- **Close Question**: End question without scoring
- **Leave Game**: Exit and delete the game session

### Student Experience

**Joining:**
1. Enter your name and team name
2. Enter the Game ID shared by instructor
3. Wait on the game board

**Answering Questions:**
1. Wait for instructor to select a question
2. Watch for visual indicators:
   - 🔴 **Red border** = Wait, buzzes are closed
   - 🟢 **Green border** = GO! Buzzes are open!
   - "Buzzes: OPEN" or "CLOSED" status displays at top
3. Click the large **BUZZ IN** button when green
4. First to buzz wins the right to answer
5. Say your answer out loud to the instructor

**Daily Doubles:**
- Only your team answers if you selected the question
- All team members must enter the **same wager amount**
- Answer when buzzes open

**Final Jeopardy:**
- See the category, then place your team's wager
- All team members must agree on wager amount
- Write down your answer after question appears
- Tell instructor your answer

### Presentation View

- Read-only display for audience
- Shows game board, scores, and current question
- Visual buzz indicators (red/green borders)
- Updates automatically - no interaction needed

## 🛠️ Technologies Used

- **Frontend**: React 18 with Hooks
- **Backend**: Firebase Firestore (real-time database)
- **Hosting**: Vercel
- **Routing**: React Router v6
- **Styling**: Custom CSS with responsive design
- **Real-time Sync**: Firebase onSnapshot listeners

## 🐛 Troubleshooting

### "Game not found" Error
- Verify the Game ID is correct (case-sensitive)
- Make sure the instructor hasn't left the game (which deletes it)
- Check that Firestore is properly configured

### Buzz Button Not Appearing
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Ensure buzzes are open (look for green border)
- Check browser console for errors

### Students Can't Join
- Confirm Game ID is typed correctly
- Verify Firestore Database is enabled in Firebase Console
- Check that test mode rules are active

### Questions Not Loading
- Verify file format matches template exactly
- Check that you have 3-8 categories
- Ensure each category has exactly 5 questions
- See `FILE_CHECKLIST.md` for validation

### Firebase Connection Issues
- Confirm `src/firebase.js` has your actual credentials
- Enable Firestore Database in Firebase Console
- Start in "test mode" for development

## 📱 Mobile Support

The app is fully optimized for mobile devices:
- Large, touch-friendly buzz button
- Responsive layouts for all screen sizes
- Optimized font sizes and spacing
- Works on phones, tablets, and desktops

## 🔒 Security Notes

- Firebase client credentials are safe to include in code
- They identify your project but don't grant access
- Real security comes from Firestore Security Rules
- For production, configure proper security rules in Firebase Console
- Admin password is hardcoded ("Feinberg123") - for development only

## 🚀 Deployment

### Vercel (Current)

The app is deployed on Vercel:

**Live URL:** https://jeopardy-sooty.vercel.app

To deploy updates:

```bash
npx vercel --prod
```

### Local Development

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`

### QR Code for Easy Access

A QR code can be generated for the deployed app URL. Students can scan this to instantly access the game on their phones.

**How to use a QR code:**
1. Display it on a slide or projector at the start of class
2. Print it on handouts or study materials
3. Share it via email or learning management system
4. Post it in your classroom for easy reference

## 📝 Development Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## 📄 License

This project is open source and available for educational and personal use.

## 🙋 Support

For issues or questions:
1. Check `HOW_TO_CREATE_GAME_FILES.md` for file format help
2. Review `FILE_CHECKLIST.md` for validation
3. See troubleshooting section above
4. Check browser console for error messages

---

**Enjoy your Jeopardy game! 🎉**
