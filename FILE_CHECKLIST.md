# Jeopardy File Checklist

Use this checklist before uploading your file to ensure it works correctly.

## Pre-Upload Checklist

### ✅ File Structure
- [ ] Line 1 contains 3-8 category names
- [ ] Each category has 5 questions
- [ ] Each question has all 5 fields: Category, Value, Question, Answer, isDailyDouble
- [ ] If using Final Jeopardy: "FINAL JEOPARDY" line followed by one line with 3 fields

### ✅ Formatting
- [ ] Using tabs (.txt) OR commas (.csv) - not mixing both
- [ ] No extra blank lines between questions
- [ ] Category names in questions match Line 1 exactly (including capitalization)
- [ ] All values are: 200, 400, 600, 800, or 1000

### ✅ Daily Doubles
- [ ] Have 1-3 questions marked with `true` in the isDailyDouble field
- [ ] All other questions have `false` in the isDailyDouble field
- [ ] Daily Doubles are in different categories (recommended)
- [ ] Daily Doubles are in $600-$1000 range (recommended)

### ✅ Question Quality
- [ ] All questions are written clearly
- [ ] All answers follow proper Jeopardy format (What is..., Who is..., etc.)
- [ ] Questions are appropriate difficulty for your audience
- [ ] No duplicate questions

### ✅ Final Jeopardy (if using)
- [ ] "FINAL JEOPARDY" appears on its own line
- [ ] Next line has: Category [TAB/comma] Question [TAB/comma] Answer
- [ ] Final Jeopardy question is more challenging than regular questions

## Quick Count Guide

### Tab-separated (.txt) files:
1. Open in a text editor (Notepad, TextEdit, VS Code)
2. Line 1 should have 2-7 tab characters (3-8 categories)
3. Question lines should have 4 tab characters each (5 fields)
4. If using Final Jeopardy: Last line should have 2 tab characters (3 fields)

### Comma-separated (.csv) files:
1. Open in a text editor or spreadsheet program
2. Line 1 should have 2-7 commas (3-8 categories)
3. Question lines should have 4 commas each (5 fields)
4. If using Final Jeopardy: Last line should have 2 commas (3 fields)

## Example Count
```
Science	History	Literature	Geography	Sports	Pop Culture
↑1     ↑2      ↑3         ↑4        ↑5     ↑6
(5 tabs = 6 categories) ✅ You can have 3-8 categories

Science	200	This is a question	This is an answer	false
↑1     ↑2  ↑3                ↑4                   ↑5
(4 tabs = 5 fields) ✅
```

## Common Issues

### ❌ "Invalid file format" error
**Cause:** Wrong number of categories
**Fix:** Verify you have 3-8 categories (each with 5 questions)

### ❌ Questions not showing up
**Cause:** Category name mismatch
**Fix:** Check spelling/capitalization of category names in questions match Line 1

### ❌ Daily Double not working
**Cause:** isDailyDouble field says something other than "true" or "false"
**Fix:** Change to lowercase "true" or "false"

### ❌ Final Jeopardy not appearing
**Cause:** Missing "FINAL JEOPARDY" header line
**Fix:** Add "FINAL JEOPARDY" on its own line before the final question

## Testing Your File

1. **Upload to instructor interface**
2. **Check that:**
   - All your categories appear across the top (3-8 total)
   - All dollar amounts appear (5 per category)
   - Click a Daily Double to verify it shows "DAILY DOUBLE!"
   - After all questions, "Start Final Jeopardy" button appears (if included)

## Need More Help?

See these files in your project:
- `FILE_FORMAT_GUIDE.md` - Complete format documentation
- `JEOPARDY_TEMPLATE.txt` - Ready-to-use template
- `sample-jeopardy.txt` - Working example
