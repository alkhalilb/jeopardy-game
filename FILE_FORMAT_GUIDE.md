# Jeopardy File Format Guide

This guide explains how to create your own Jeopardy game files.

## Quick Start

1. Download either `JEOPARDY_TEMPLATE.txt` or `JEOPARDY_TEMPLATE.csv`
2. Replace the placeholder text with your own content
3. Upload to the instructor interface

## File Format Specification

### Line 1: Categories (Required)
The first line contains your category names (3-8 categories).

**Tab-separated (.txt):**
```
Science	History	Movies	Sports	Music	Food
```

**Comma-separated (.csv):**
```
Science,History,Movies,Sports,Music,Food
```

**Note:** You can have anywhere from 3 to 8 categories. The example above shows 6.

### Lines 2-31: Questions (Required)
Each line contains one question with 5 fields:

| Field | Description | Example |
|-------|-------------|---------|
| 1. Category | Must match a category from line 1 | `Science` |
| 2. Value | Point value (200, 400, 600, 800, 1000) | `400` |
| 3. Question | The clue text | `This element has symbol Au` |
| 4. Answer | The correct answer | `What is Gold` |
| 5. isDailyDouble | `true` or `false` | `false` |

**Tab-separated (.txt) example:**
```
Science	400	This element has symbol Au	What is Gold	false
History	600	The year WWII ended	What is 1945	true
```

**Comma-separated (.csv) example:**
```
Science,400,This element has symbol Au,What is Gold,false
History,600,The year WWII ended,What is 1945,true
```

### Standard Game Structure
- **3-8 categories** (flexible - choose what works for you!)
- **5 questions per category**
- **Values:** $200, $400, $600, $800, $1000
- **1-3 Daily Doubles** (recommended: 2)

### Final Jeopardy (Optional)

After all regular questions, add:

**Tab-separated (.txt):**
```
FINAL JEOPARDY
U.S. Presidents	This president was the first to live in the White House	Who is John Adams
```

**Comma-separated (.csv):**
```
FINAL JEOPARDY
U.S. Presidents,This president was the first to live in the White House,Who is John Adams
```

## Daily Doubles

Mark Daily Doubles by setting the 5th field to `true`:

```
Literature	800	The author of 1984	Who is George Orwell	true
```

**Recommended placement:**
- 1 Daily Double in the $600-$800 range
- 1 Daily Double in the $800-$1000 range
- Spread across different categories

## Important Notes

### Tab vs Comma Separation
- **.txt files:** Use TAB characters (press the Tab key)
- **.csv files:** Use commas
- **Don't mix:** Pick one format and stick with it

### Common Mistakes to Avoid

❌ **Wrong number of categories in line 1:**
```
Science	History
Science	200	Question text	Answer	false
```
You need between 3 and 8 categories!

❌ **Wrong number of fields:**
```
Science	200	Question text	false
```
You need all 5 fields: Category, Value, Question, Answer, isDailyDouble

❌ **Mixing tabs and commas:**
```
Science,200	Question text	Answer	false
```
Use tabs OR commas, not both!

❌ **Typo in category name:**
```
Science	History	Movies	Sports	Music	Food
Sceince	200	Question text	Answer	false
```
Category must exactly match one from line 1!

❌ **Missing FINAL JEOPARDY header:**
```
Final Category	Question	Answer
```
Must have "FINAL JEOPARDY" on its own line first!

## Example: Complete Game File

```
Science	History	Literature	Geography	Sports	Pop Culture
Science	200	This planet is the Red Planet	What is Mars	false
Science	400	The powerhouse of the cell	What is mitochondria	false
Science	600	This element has symbol Au	What is Gold	true
Science	800	The study of earthquakes	What is Seismology	false
Science	1000	Most abundant gas in atmosphere	What is Nitrogen	false
History	200	Signed in 1776	What is Declaration of Independence	false
History	400	First US President	Who is George Washington	false
History	600	WWII ended this year	What is 1945	false
History	800	This wall fell in 1989	What is Berlin Wall	true
History	1000	City buried by Vesuvius	What is Pompeii	false
[... continue with all 30 questions ...]
FINAL JEOPARDY
U.S. Presidents	First president to live in White House	Who is John Adams
```

## Testing Your File

Before using in a real game:
1. Count your categories (should be exactly 6)
2. Count your questions (should be 30 for a full board)
3. Verify each category has 5 questions
4. Check that you have 1-3 Daily Doubles marked with `true`
5. If using Final Jeopardy, verify the format

## Need Help?

- See `sample-jeopardy.txt` for a complete working example
- Use the provided templates as starting points
- Make sure you're using tab characters (not spaces) for .txt files
- Open your file in a text editor (not Word) to verify formatting
