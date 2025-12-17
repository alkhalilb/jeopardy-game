================================================================================
JEOPARDY GAME FILE CREATION KIT
================================================================================

Welcome! This package contains everything you need to create your own
Jeopardy game files.

================================================================================
GETTING STARTED (3 Steps)
================================================================================

1. READ: Open "HOW_TO_CREATE_GAME_FILES.md" for a beginner-friendly guide

2. CHOOSE: Pick a template to work with:
   - JEOPARDY_TEMPLATE.txt (recommended - use tabs)
   - JEOPARDY_TEMPLATE.csv (use commas)

3. CREATE: Replace the placeholder text with your questions and answers

================================================================================
FILE FORMAT SUMMARY
================================================================================

Your file needs:
✓ Line 1: 6 category names (separated by tabs or commas)
✓ Lines 2-31: 30 questions with 5 fields each:
    Category | Value | Question | Answer | isDailyDouble
✓ 1-3 Daily Doubles (set last field to "true")
✓ Optional: Final Jeopardy at the end

================================================================================
DAILY DOUBLES
================================================================================

To mark a question as a Daily Double, set the last field to "true":

Example:
Science	800	Study of earthquakes	What is Seismology	true

Recommended: 2 Daily Doubles in the $600-$1000 range

================================================================================
FINAL JEOPARDY (Optional)
================================================================================

Add at the end of your file:

FINAL JEOPARDY
Category Name	The question text	The answer

Example:
FINAL JEOPARDY
U.S. Presidents	First to live in White House	Who is John Adams

================================================================================
INCLUDED FILES
================================================================================

📖 GUIDES (Read these!)
   • HOW_TO_CREATE_GAME_FILES.md - Start here! User-friendly guide
   • FILE_FORMAT_GUIDE.md - Detailed technical specification
   • FILE_CHECKLIST.md - Pre-upload verification checklist

📝 TEMPLATES (Use these!)
   • JEOPARDY_TEMPLATE.txt - Tab-separated template
   • JEOPARDY_TEMPLATE.csv - Comma-separated template

📋 EXAMPLE
   • sample-jeopardy.txt - Complete working example

================================================================================
QUICK FORMAT REFERENCE
================================================================================

TAB-SEPARATED (.txt) FORMAT:
----------------------------
Category1[TAB]Category2[TAB]Category3[TAB]Category4[TAB]Category5[TAB]Category6
Category1[TAB]200[TAB]Question text[TAB]Answer text[TAB]false
Category1[TAB]400[TAB]Question text[TAB]Answer text[TAB]false
Category1[TAB]600[TAB]Question text[TAB]Answer text[TAB]true
... (continue for all 30 questions)
FINAL JEOPARDY
Category[TAB]Question[TAB]Answer

COMMA-SEPARATED (.csv) FORMAT:
------------------------------
Category1,Category2,Category3,Category4,Category5,Category6
Category1,200,Question text,Answer text,false
Category1,400,Question text,Answer text,false
Category1,600,Question text,Answer text,true
... (continue for all 30 questions)
FINAL JEOPARDY
Category,Question,Answer

================================================================================
CHECKLIST BEFORE UPLOADING
================================================================================

□ Line 1 has exactly 6 categories
□ Lines 2-31 have exactly 30 questions
□ Each question has all 5 fields
□ Category names in questions match Line 1 exactly
□ Each category has 5 questions: $200, $400, $600, $800, $1000
□ 1-3 questions marked as Daily Doubles (true)
□ All other questions marked as false
□ If using Final Jeopardy: "FINAL JEOPARDY" header line is present
□ Saved as .txt or .csv file

================================================================================
COMMON MISTAKES
================================================================================

❌ Mixing tabs and commas (pick one format!)
❌ Spelling category names differently in questions
❌ Using "True" instead of "true" for Daily Doubles
❌ Forgetting the "FINAL JEOPARDY" header line
❌ Missing fields in questions

================================================================================
NEED HELP?
================================================================================

1. Check sample-jeopardy.txt for a complete working example
2. Read FILE_FORMAT_GUIDE.md for detailed explanations
3. Use FILE_CHECKLIST.md to verify your file before uploading

================================================================================
TIPS FOR GREAT GAMES
================================================================================

• Write clear, concise questions
• Use proper Jeopardy answer format: "What is...", "Who is..."
• Increase difficulty with dollar value
• Place Daily Doubles strategically ($600-$1000 range)
• Test your file before game day!

================================================================================

Ready to create your game? Open a template and start filling it in!

Good luck! 🎉

================================================================================
