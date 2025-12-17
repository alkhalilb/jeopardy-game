# How to Create Your Own Jeopardy Game

**Welcome!** This guide will help you create a Jeopardy game file that you can upload and play.

## 📋 What You Need

1. A text editor (Notepad on Windows, TextEdit on Mac, or any code editor)
2. One of the template files provided
3. Your questions and answers

## 🚀 Quick Start (3 Easy Steps)

### Step 1: Choose a Template

Pick one and open it in a text editor:
- **`JEOPARDY_TEMPLATE.txt`** (recommended - tab-separated)
- **`JEOPARDY_TEMPLATE.csv`** (comma-separated)

### Step 2: Fill in Your Content

Replace the placeholder text with your own:

1. **Line 1:** Your 3-8 category names
   ```
   Science	History	Movies	Sports	Music	Food
   ```
   (This example shows 6, but you can use 3-8)

2. **Lines 2-31:** Your 30 questions (5 per category)
   ```
   Science	200	Your question here	Your answer here	false
   Science	400	Your question here	Your answer here	false
   Science	600	Your question here	Your answer here	true
   ...
   ```

3. **Last lines (optional):** Final Jeopardy
   ```
   FINAL JEOPARDY
   Your Category	Your question	Your answer
   ```

### Step 3: Mark Your Daily Doubles

Change `false` to `true` for 1-3 questions to make them Daily Doubles:
```
Science	800	A challenging question	The answer	true
```

## 📐 File Format Rules

### The 5 Fields for Each Question

Every question line needs these 5 parts (separated by tabs or commas):

| #  | Field          | What to Put                    | Example                   |
|----|----------------|--------------------------------|---------------------------|
| 1  | Category       | Must match one from Line 1     | `Science`                 |
| 2  | Value          | 200, 400, 600, 800, or 1000    | `400`                     |
| 3  | Question       | The clue text                  | `The Red Planet`          |
| 4  | Answer         | In Jeopardy format             | `What is Mars`            |
| 5  | isDailyDouble  | `true` or `false`              | `false`                   |

### Standard Game Structure

✅ **Correct:**
- 3-8 categories (flexible!)
- Exactly 5 questions per category
- Values: $200, $400, $600, $800, $1000 for each category
- 1-3 questions marked as Daily Doubles
- Optional: 1 Final Jeopardy at the end

## 💡 Tips & Tricks

### Writing Good Questions
- Keep questions clear and concise
- Write answers in Jeopardy format: "What is...", "Who is...", "Where is..."
- Make sure difficulty increases with dollar value

### Daily Doubles
- Recommended: Place 2 Daily Doubles in your game
- Put them in the $600-$1000 range
- Spread them across different categories

### Common Mistakes to Avoid

❌ **Don't do this:**
- Spelling category names differently in questions
- Using spaces instead of tabs in .txt files
- Forgetting the "FINAL JEOPARDY" header line
- Having only 4 fields per question

✅ **Do this:**
- Copy category names exactly from Line 1
- Use the Tab key for .txt files
- Add "FINAL JEOPARDY" on its own line
- Always include all 5 fields

## 📝 Example

Here's a complete mini-example (just showing first 2 categories):

```
Science	History	Movies	Sports	Music	Food
Science	200	The Red Planet	What is Mars	false
Science	400	H2O	What is Water	false
Science	600	The powerhouse of the cell	What is mitochondria	true
Science	800	Study of earthquakes	What is Seismology	false
Science	1000	Most abundant gas in atmosphere	What is Nitrogen	false
History	200	Signed in 1776	What is Declaration of Independence	false
History	400	First US President	Who is George Washington	false
History	600	Year WWII ended	What is 1945	false
History	800	This wall fell in 1989	What is Berlin Wall	true
History	1000	City buried by Vesuvius	What is Pompeii	false
... (continue for all 6 categories)
FINAL JEOPARDY
World Leaders	This leader was known as the Iron Lady	Who is Margaret Thatcher
```

## ✅ Before You Upload - Checklist

Use this quick checklist:

- [ ] I have 3-8 categories on Line 1
- [ ] Each category has exactly 5 questions
- [ ] Each category has all 5 values: 200, 400, 600, 800, 1000
- [ ] I marked 1-3 Daily Doubles with `true`
- [ ] All other questions have `false`
- [ ] Category names in questions match Line 1 exactly
- [ ] If using Final Jeopardy, I added "FINAL JEOPARDY" header

## 🎮 Testing Your File

1. Save your file as a `.txt` or `.csv`
2. In the Jeopardy app, click "Instructor"
3. Upload your file
4. Check that all categories and questions appear correctly
5. Click on a Daily Double to verify it shows "DAILY DOUBLE!"

## 📚 More Resources

Need more help? Check these files:
- **`sample-jeopardy.txt`** - A complete working example you can look at
- **`FILE_FORMAT_GUIDE.md`** - Detailed technical documentation
- **`FILE_CHECKLIST.md`** - Verification checklist

## ❓ Troubleshooting

**"Invalid file format" error?**
- Check that Line 1 has 3-8 categories
- Verify each category has 5 questions

**Questions not showing up?**
- Make sure category names match exactly (including capitalization)

**Daily Double not working?**
- Use lowercase: `true` not `True` or `TRUE`

---

**Ready to play?** Save your file and upload it in the instructor interface!

Good luck and have fun! 🎉
