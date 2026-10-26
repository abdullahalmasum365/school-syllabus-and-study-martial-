const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const portalDir = __dirname;
const downloadsDir = path.join(portalDir, 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function classifyFile(fileName, relPath) {
  const lower = fileName.toLowerCase().replace(/_/g, ' ');
  const lowerRel = relPath.toLowerCase().replace(/_/g, ' ');

  let category = 'other';
  let badge = 'Resource';
  let term = 'General';

  if (lower.includes('term 2') || lowerRel.includes('term 2') || lower.includes('term2') || lowerRel.includes('term2') || lower.includes('t2 ') || lower.includes('t2_') || lower.includes('t2')) {
    term = 'Term 2';
  } else if (lower.includes('term 1') || lowerRel.includes('term 1') || lower.includes('term1') || lowerRel.includes('term1') || lower.includes('ca1') || lowerRel.includes('2026-08') || lowerRel.includes('2026-09')) {
    term = 'Term 1';
  }

  const isAnswerKey = lower.includes('answer key') || lower.includes('answer sheet') || lower.includes('solution') || lower.includes('mark scheme');
  const isQuestionPaper = lower.includes('question paper') || lower.includes('class test') || lower.includes('exam') || lower.includes('ct 1') || lower.includes('ct 2') || lower.includes('ca1') || lower.includes('ct1') || lower.includes('ct2');
  const isWorkbook = lower.includes('workbook');
  const isWorksheet = lower.includes('worksheet') || isWorkbook || lower.includes('study guide') || lower.includes('study material') || lower.includes('practice');
  const isTermPlan = lower.includes('term plan') || lower.includes('lesson plan');
  const isRevision = lower.includes('revision');
  const isBook = lower.includes('book') || lower.includes('coursebook') || lower.includes('reference') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');

  let examType = null;
  if (lower.includes('ct 1') || lower.includes('ct1') || lower.includes('class test 1')) examType = 'Class Test 1';
  else if (lower.includes('ct 2') || lower.includes('ct2') || lower.includes('class test 2')) examType = 'Class Test 2';
  else if (lower.includes('ca1') || lower.includes('ca 1')) examType = 'CA 1 Exam';

  if (isQuestionPaper || examType) {
    category = 'exam';
    badge = isAnswerKey ? 'Answer Key' : (examType || 'Exam Paper');
  } else if (isWorkbook) {
    category = 'worksheet';
    badge = isAnswerKey ? 'Workbook Solution' : '16-Page Workbook';
  } else if (isWorksheet) {
    category = 'worksheet';
    badge = isAnswerKey ? 'Worksheet Solution' : 'Worksheet';
  } else if (isTermPlan) {
    category = 'term_plan';
    badge = 'Term Plan';
  } else if (isRevision) {
    category = 'revision';
    badge = 'Revision Guide';
  } else if (isBook) {
    category = 'reference';
    badge = 'Reference Book / Page';
  }

  return { category, badge, term, isAnswerKey, examType };
}

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const { p1Term2Weeks, p2Term2Weeks, p3Term2Weeks, sec1Term2Weeks, sec2Term2Weeks } = require('./term2_plans.js');

// Full Enhanced Class Configurations
const classConfigs = [
  {
    id: 'p1',
    name: 'Primary 1',
    code: 'P1',
    grade: 'Primary Level 1',
    icon: '🐣',
    subjects: ['IT', 'English'],
    folders: ['01 - Primary 1'],
    classesPerWeek: 2,
    defaultBook: 'Kinderland IT Coursebook Level 1',
    defaultBookFile: 'downloads/p1/WhatsApp_Image_2026-10-07_at_2.35.25_PM.jpeg',
    defaultHwFile: 'downloads/p1/P1_IT_Term2_Comprehensive_Workbook_16Pages.pdf',
    defaultAnswerFile: 'downloads/p1/P1_IT_Term2_Comprehensive_Worksheet_Answer_Key.pdf',
    term2Weeks: p1Term2Weeks,
    term1Weeks: [
      {
        week: 1,
        title: 'Computer Parts & Mouse Control Fundamentals',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 2–4',
            topic: 'Main Parts of Computer (Monitor, CPU, Keyboard, Mouse)',
            inClassActivity: 'Physical identification of 4 main hardware parts in the lab. Turning on monitor and observing CPU power light.',
            homework: 'Read Pages 2-3 at home. Point to and name the 4 parts to your parents.',
            diary: 'Read TB Pg 2-4. Practice identifying Monitor, CPU, Keyboard, and Mouse.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 5–7',
            topic: 'Mouse Skills (Left Click, Right Click, Double Click & Drag)',
            inClassActivity: 'Lab practice: Proper mouse grip, clicking desktop icons, dragging items, and double clicking to open folders.',
            homework: 'Complete Worksheet 1 (Page 5: Trace the Mouse Path and match click types).',
            diary: 'Complete Worksheet 1 (Pg 5). Practice holding mouse gently.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          }
        ]
      },
      {
        week: 2,
        title: 'Keyboard Mastery & Alphabet Typing',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 8–10',
            topic: 'Alphabet & Number Keys Layout',
            inClassActivity: 'Locating A-Z keys and 0-9 keys on standard keyboard layout. Finding home row keys.',
            homework: 'Draw the Spacebar and Enter key in your computer notebook.',
            diary: 'Read TB Pg 8-10. Remember where Spacebar and Enter keys are.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 11–13',
            topic: 'Typing Short Words in WordPad / Notepad',
            inClassActivity: 'Opening Notepad. Typing student name, grade, and 5 animal names using Spacebar and Backspace.',
            homework: 'Practice typing 5 3-letter words (CAT, DOG, SUN, BUS, CUP) at home.',
            diary: 'Type your name 5 times in Notepad/WordPad.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'MS Paint - Shapes, Lines & Colors',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 14–17',
            topic: 'Introduction to MS Paint Ribbon & Basic Shapes',
            inClassActivity: 'Launching MS Paint. Drawing geometric shapes: Rectangle, Circle/Oval, Triangle, and Star using mouse drag.',
            homework: 'Color the shapes in the printed worksheet (Pg 16).',
            diary: 'Read TB Pg 14-16. Review the Paint tools ribbon.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 18–20',
            topic: 'Fill With Color Bucket & Eraser Tool',
            inClassActivity: 'Hands-on drawing: Drawing a colorful house with a roof and door. Using Fill with Color bucket and Eraser tool.',
            homework: 'Draw and color your favorite fruit using Paint or on paper.',
            diary: 'Complete Paint Homework Sheet Q1-Q3.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Mock Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 2–20 (Chapters 1 & 2)',
            topic: 'Comprehensive Review of Computer Parts, Keys & Paint',
            inClassActivity: 'Interactive quiz game in class. Matching computer parts with pictures. Rapid question round on keyboard keys.',
            homework: 'Revise Chapters 1 and 2 thoroughly from textbook for CT 1 next week.',
            diary: 'Revise TB Pg 2-20 for Class Test 1 (CT 1) next week.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p1/P1_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'CT 1 Model Paper',
            topic: 'Solving CT 1 Sample Practice Paper',
            inClassActivity: 'Solving sample questions on the board. Identifying common mistakes in spelling and tool names.',
            homework: 'Solve the attached CT 1 Practice Sheet at home.',
            diary: 'Prepare for Class Test 1 (CT 1). Solve CT 1 sample paper.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p1/P1_T1_CT_1_IT_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Storage Introduction',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (25 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written exam paper under exam conditions.',
            homework: 'Read Page 21: Storage Devices in computers.',
            diary: 'CT 1 completed today! Read TB Pg 21 for next class.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p1/P1_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 21–23',
            topic: 'Where Do Computers Store Things? (Hard Disk & Pen Drive)',
            inClassActivity: 'Showing real physical samples of a Pen Drive and external Hard Disk. Explaining how files are saved.',
            homework: 'Name 2 places where we keep our school books vs where a computer keeps files.',
            diary: 'Read TB Pg 22. Learn names of 2 storage devices.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Do’s and Don’ts in the Computer Lab',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 24–26',
            topic: 'Computer Lab Ethics & Hygiene Rules',
            inClassActivity: 'Discussion on lab rules: clean hands, walking in a line, sitting upright, gentle key presses.',
            homework: 'Write 3 Do’s and 3 Don’ts in your notebook from textbook Page 25.',
            diary: 'Read TB Pg 24-26. Follow lab safety rules.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Answer_Sheet_Pages_2-5.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 27–29',
            topic: 'Electrical Safety & Device Protection',
            inClassActivity: 'Teaching kids never to touch plugs, sockets, or loose wires. Proper shut down steps (Start > Shut down).',
            homework: 'Practice explaining the correct way to turn off a computer.',
            diary: 'Remember the 3 steps to shut down a computer safely.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & Revision',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 21–29',
            topic: 'Storage Devices & Lab Safety Rules Review',
            inClassActivity: 'Solving review questions on the whiteboard. Match the following exercises.',
            homework: 'Revise all Storage and Safety rules for CT 2.',
            diary: 'Prepare for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx',
            answerKeyUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Spark Book 1',
            pages: 'Pages 30–31',
            topic: 'Mock Test 2 Solving & Discussion',
            inClassActivity: 'Solving CT 2 sample questions. Checking answers collaboratively.',
            homework: 'Complete Mock Test 2 sheet.',
            diary: 'CT 2 next week! Study thoroughly.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx',
            answerKeyUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Practical Showcase',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (25 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students take the CT 2 written exam under timed conditions.',
            homework: 'Enjoy your weekend! Bring colors for next week’s practical fun.',
            diary: 'CT 2 completed today! Excellent effort.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx',
            answerKeyUrl: 'downloads/p1/Primary1_IT_Term1_Class_Test_2_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Interactive Lab Activity',
            pages: 'Creative Practical',
            topic: 'Creative Painting & Typing Exhibition',
            inClassActivity: 'Students create their dream drawing in MS Paint and type a one-line description.',
            homework: 'Show your printed lab artwork to parents.',
            diary: 'Term 2 Week 8 project exhibition completed.',
            bookPageUrl: 'downloads/p1/IT_worksheet_p1.pdf',
            hwFileUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.pdf',
            answerKeyUrl: 'downloads/p1/P1_IT_Worksheet_1_Full_Answer_Sheet__Chapters_1___2_.docx'
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Primary 2',
    code: 'P2',
    grade: 'Primary Level 2',
    icon: '🌱',
    subjects: ['IT'],
    folders: ['02 - Primary 2'],
    classesPerWeek: 2,
    defaultBook: 'Oxford Keyboard / IT Spark Level 2',
    defaultBookFile: 'downloads/p2/WhatsApp_Image_2026-10-07_at_11.28.41_AM.jpeg',
    defaultHwFile: 'downloads/p2/P2_IT_Term2_Comprehensive_Workbook_16Pages.pdf',
    defaultAnswerFile: 'downloads/p2/P2_IT_Term2_Comprehensive_Workbook_Answer_Key_16Pages.pdf',
    term2Weeks: p2Term2Weeks,
    term1Weeks: [
      {
        week: 1,
        title: 'Input vs Output Devices Classification & Deep Dive',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 2–4',
            topic: 'Input Devices (Keyboard, Mouse, Scanner, Microphone)',
            inClassActivity: 'Differentiating how data enters the computer. Hands-on demo of microphone voice input and optical mouse sensor.',
            homework: 'Solve Worksheet 1 (Pages 2-4: Identify 5 input devices and their uses).',
            diary: 'Read TB Pg 2-4. Complete Worksheet 1 Q1-Q4.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 5–8',
            topic: 'Output Devices (Monitor, Printer, Speakers, Headphones)',
            inClassActivity: 'Soft copy vs Hard copy concept. Printing a sample test sheet and listening to system audio through speakers.',
            homework: 'List 3 differences between a Monitor (soft copy) and a Printer (hard copy).',
            diary: 'Write differences between soft copy and hard copy in notebook.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 2,
        title: 'The IPO Cycle (Input - Process - Output)',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 9–11',
            topic: 'Understanding the IPO Cycle with Daily Life Examples',
            inClassActivity: 'Explaining IPO cycle using toaster (bread -> heat -> toast) and washing machine (dirty clothes -> wash -> clean clothes).',
            homework: 'Draw the IPO cycle chart in your computer notebook with 1 new example.',
            diary: 'Read TB Pg 9-11. Draw IPO cycle chart in copy.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 12–14',
            topic: 'The Processing Device: Role of CPU',
            inClassActivity: 'Why is CPU called the brain of the computer? How it calculates numbers and makes decisions.',
            homework: 'Complete IPO worksheet match columns A, B, and C.',
            diary: 'Complete IPO Worksheet Task B.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'WordPad Fundamentals - Text Formatting',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 15–18',
            topic: 'WordPad Interface & Font Customization',
            inClassActivity: 'Opening WordPad. Identifying Title Bar, Ribbon, Text Area. Changing Font Family, Size, and Font Color.',
            homework: 'Type 3 lines about your school in WordPad and format with colors.',
            diary: 'Read TB Pg 15-18. Practice font size and color in WordPad.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 19–21',
            topic: 'Bold, Italic, Underline & Text Alignment',
            inClassActivity: 'Highlighting text and applying B, I, U styles. Practicing Left, Center, Right alignments.',
            homework: 'Complete WordPad Formatting Task Sheet.',
            diary: 'Practice B, I, U and text alignment in WordPad.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Mock Test',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 2–21 (Revision)',
            topic: 'Recap of Input/Output, IPO Cycle and WordPad',
            inClassActivity: 'Quick quiz on Input vs Output devices and IPO stages. Clearing doubts.',
            homework: 'Revise all notes for Class Test 1 (CT 1) next week.',
            diary: 'Study TB Pg 2-21 thoroughly for Class Test 1 (CT 1).',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p2/P2_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'CT 1 Model Paper',
            topic: 'Solving CT 1 Model Paper & Answering Techniques',
            inClassActivity: 'Solving sample questions on the board. Reviewing proper diagram drawing for IPO.',
            homework: 'Complete CT 1 Model Paper at home.',
            diary: 'CT 1 next week! Review the model question paper.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p2/P2_T1_CT_1_IT_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Storage Devices',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (25 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written exam paper under exam conditions.',
            homework: 'Read Page 22: Storage Devices in computers.',
            diary: 'CT 1 finished today! Read TB Pg 22 for next class.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p2/P2_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 22–25',
            topic: 'Computer Memory & Storage Devices (Hard Disk, CD/DVD, Pen Drive)',
            inClassActivity: 'Comparing portable storage (Pen drive, Memory card) with internal Hard Disk.',
            homework: 'Write 3 advantages of using a Pen Drive over a CD.',
            diary: 'Read TB Pg 22-25. Note down storage device types.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Multimedia & Sound in Computers',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 26–29',
            topic: 'What is Multimedia? (Text, Graphics, Audio, Video, Animation)',
            inClassActivity: 'Exploring multimedia components in educational software and video players.',
            homework: 'Complete Multimedia identification worksheet.',
            diary: 'Read TB Pg 26-29 on Multimedia elements.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 30–32',
            topic: 'Playing Sound & Video Responsibly',
            inClassActivity: 'Adjusting system volume, using headphones safely, controlling media playback.',
            homework: 'List 2 safe habits when using headphones.',
            diary: 'Follow safe listening volume rules.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & Review',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'Pages 22–32',
            topic: 'Storage Devices & Multimedia Comprehensive Review',
            inClassActivity: 'Solving practice question bank in groups.',
            homework: 'Revise Chapters 3 & 4 for Class Test 2 (CT 2).',
            diary: 'Prepare for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Oxford Keyboard IT Book 2',
            pages: 'CT 2 Model Questions',
            topic: 'Mock Test 2 Solving & Doubt Clearance',
            inClassActivity: 'Timed solving of 15 objective questions in class.',
            homework: 'Solve the attached CT 2 sample paper.',
            diary: 'CT 2 next week! Revise all definitions.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Practical Workshop',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (25 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students sit for the CT 2 written exam under exam supervision.',
            homework: 'Enjoy your weekend! Great job on CT 2.',
            diary: 'CT 2 examination completed today.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p2/P2_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Practical Activity Sheet',
            pages: 'Practical Project',
            topic: 'Term 2 Document Formatting Workshop',
            inClassActivity: 'Typing a 5-line story in WordPad with heading, bold text, and colored font.',
            homework: 'Print or save your story file.',
            diary: 'Term 2 Week 8 practical project finished.',
            bookPageUrl: 'downloads/p2/IT__primary2.pdf._16_copies',
            hwFileUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Updated.pdf',
            answerKeyUrl: 'downloads/p2/P2_IT_Worksheet_1_Answer_Sheet_Pages_2-4.docx'
          }
        ]
      }
    ]
  },
  {
    id: 'p3',
    name: 'Primary 3',
    code: 'P3',
    grade: 'Primary Level 3',
    icon: '📘',
    subjects: ['IT'],
    folders: ['03 - Primary 3', '03 - Primary 3 (P3)'],
    classesPerWeek: 2,
    defaultBook: 'Oxford Keyboard / IT Spark Book 3',
    defaultBookFile: 'downloads/p3/WhatsApp_Image_2026-10-07_at_11.34.26_AM.jpeg',
    defaultHwFile: 'downloads/p3/P3_IT_Term2_Comprehensive_Workbook_16Pages.pdf',
    defaultAnswerFile: 'downloads/p3/P3_IT_Term2_Comprehensive_Workbook_Answer_Key_16Pages.pdf',
    term2Weeks: p3Term2Weeks,
    term1Weeks: [
      {
        week: 1,
        title: 'CPU Architecture (ALU & CU) & Motherboard Ports',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3 - Chapter 1A',
            pages: 'Pages 2–4',
            topic: 'CPU Components: Control Unit (CU) & Arithmetic Logic Unit (ALU)',
            inClassActivity: 'Explaining CPU as brain of computer. Detailed functions of CU (supervisor) and ALU (math & logic decisions). Real hardware demo.',
            homework: 'Read TB Pages 2-4. Complete Worksheet Task A (CU vs ALU functions).',
            diary: 'Read TB Pg 2-4. Define CU and ALU roles in notebook.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/p3_IT_worksheet_1_Answer_Sheet_Pages_2-7.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3 - Chapter 1A',
            pages: 'Pages 5–7',
            topic: 'Computer Ports (Serial, Parallel, USB & HDMI)',
            inClassActivity: 'Inspecting motherboard back panel. Comparing Serial port (1-bit), Parallel printer port, and high-speed USB.',
            homework: 'Complete Worksheet Task B on Ports matching and True/False statements.',
            diary: 'Complete Worksheet on Ports (TB Pg 6-7).',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      },
      {
        week: 2,
        title: 'Ethics in Computing & Cyber Bullying Prevention',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3 - Chapter 2',
            pages: 'Pages 8–9',
            topic: 'Moral Principles in Computing & Plagiarism',
            inClassActivity: 'Defining Computer Ethics. Why copying someone else\'s work without permission is Plagiarism and wrong. Proper crediting.',
            homework: 'Write 3 examples of ethical computer use in your notebook.',
            diary: 'Read TB Pg 8-9 on Plagiarism and intellectual property.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3 - Chapter 2',
            pages: 'Pages 10–12',
            topic: 'Cyber Bullying Prevention & Internet Safety Rules',
            inClassActivity: 'Identifying online threats, abusive messages, and reporting to teachers/parents immediately. Practicing Netiquette.',
            homework: 'Complete Cyber Safety Case Study Q1-Q3 in workbook.',
            diary: 'Write 3 rules for being safe on the internet.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/p3_IT_worksheet_1_Answer_Sheet_Pages_2-7.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'Software Classification: System vs Application Software',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3 - Chapter 3',
            pages: 'Pages 13–16',
            topic: 'Operating Systems (Windows, macOS, Android, Linux)',
            inClassActivity: 'Why does a computer need an Operating System? The OS as a manager connecting hardware and applications.',
            homework: 'Read TB Pg 13-15. List 4 operating systems you see around you.',
            diary: 'Read TB Pg 13-16. Define Operating System.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3 - Chapter 3',
            pages: 'Pages 17–20',
            topic: 'Application Software (Word Processors, Spreadsheets, Browsers)',
            inClassActivity: 'Classifying everyday software into System vs Application categories. Matching tasks with correct apps.',
            homework: 'Complete Worksheet on Software Types (Part C).',
            diary: 'Complete Software Classification Worksheet.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/p3_IT_worksheet_1_Answer_Sheet_Pages_2-7.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Mock Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3',
            pages: 'Chapters 1A, 2 & 3',
            topic: 'Comprehensive Review for CT 1 (CPU, Ethics & Software)',
            inClassActivity: 'Reviewing key concepts: ALU/CU functions, Plagiarism definition, System vs Application software differences.',
            homework: 'Revise all notes and textbook pages 2-20 for CT 1.',
            diary: 'Study for Class Test 1 (CT 1) scheduled next week.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p3/P3_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3',
            pages: 'CT 1 Model Paper',
            topic: 'Solving CT 1 Past Exam Paper (30+5=35 Marks)',
            inClassActivity: 'Timed mock test solving in class. Marking scheme explanation by teacher.',
            homework: 'Complete CT 1 mock paper corrections.',
            diary: 'Solve CT 1 model paper at home.',
            bookPageUrl: 'downloads/p3/Primary3_IT_CA1_Part_1.pdf',
            hwFileUrl: 'downloads/p3/Primary3_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p3/Primary3_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & MS Word Tables Intro',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (35 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written examination under formal exam conditions.',
            homework: 'Read Page 22: Creating Tables in MS Word.',
            diary: 'CT 1 exam completed today! Read TB Pg 22.',
            bookPageUrl: 'downloads/p3/Primary3_IT_CA1_Part_1.pdf',
            hwFileUrl: 'downloads/p3/P3_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p3/P3_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3 - Chapter 4',
            pages: 'Pages 22–25',
            topic: 'Creating Tables in MS Word (Rows, Columns, Cells)',
            inClassActivity: 'Inserting a 4x4 Table in MS Word. Entering timetable data into cells. Moving across cells using Tab key.',
            homework: 'Create a 3x3 table on a sheet showing your daily morning routine.',
            diary: 'Practice inserting a Table in MS Word at home.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Table Formatting, Borders & Shading in MS Word',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3 - Chapter 4',
            pages: 'Pages 26–28',
            topic: 'Merging & Splitting Cells & Table Design Styles',
            inClassActivity: 'Merging header row cells for a main title. Applying Table styles, cell shading, and custom border colors.',
            homework: 'Complete Worksheet on Table formatting tools.',
            diary: 'Read TB Pg 26-28. Practice merge cells in MS Word.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/p3_IT_worksheet_1_Answer_Sheet_Pages_2-7.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3 - Chapter 4',
            pages: 'Pages 29–31',
            topic: 'Inserting Images into Tables & Aligning Cell Text',
            inClassActivity: 'Building a student ID card table: inserting photo, centering text vertically and horizontally.',
            homework: 'Design a mini greeting card layout using MS Word table.',
            diary: 'Complete Table ID Card project task.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & CA1 Paper 2 Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Kinderland IT Book 3',
            pages: 'Chapters 3 & 4',
            topic: 'System Software & Table Tools Revision for CT 2',
            inClassActivity: 'Solving practice question bank in pairs. Reviewing shortcut keys for Word tables.',
            homework: 'Revise Chapters 3 & 4 for Class Test 2 (CT 2).',
            diary: 'Study for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/p3/Primary3_IT_CA1_Part_2.pdf',
            hwFileUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Kinderland IT Book 3',
            pages: 'CT 2 Model Paper',
            topic: 'Timed Solving of CT 2 Model Examination',
            inClassActivity: 'Simulating full 35-mark test paper in class. Feedback on common mistakes.',
            homework: 'Complete CT 2 mock paper review.',
            diary: 'CT 2 next week! Revise all definitions and steps.',
            bookPageUrl: 'downloads/p3/Primary3_IT_CA1_Part_2.pdf',
            hwFileUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Practical Evaluation',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (35 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students sit for the CT 2 written exam under exam supervision.',
            homework: 'Well done on completing CT 2!',
            diary: 'CT 2 examination completed today.',
            bookPageUrl: 'downloads/p3/Primary3_IT_CA1_Part_2.pdf',
            hwFileUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p3/Primary3_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Practical Lab Guide',
            pages: 'Assessment Project',
            topic: 'Hands-on Table Design Assessment in Lab',
            inClassActivity: 'Lab evaluation: Students build a formatted class routine table from scratch in MS Word.',
            homework: 'Review teacher feedback on CT 2.',
            diary: 'Term 2 Week 8 practical completed.',
            bookPageUrl: 'downloads/p3/p3_IT_worksheet_1.pdf_10_copies_',
            hwFileUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.pdf',
            answerKeyUrl: 'downloads/p3/P3_IT_Worksheet_1_Answer_Sheet.docx'
          }
        ]
      }
    ]
  },
  {
    id: 'p4',
    name: 'Primary 4',
    code: 'P4',
    grade: 'Primary Level 4',
    icon: '📗',
    subjects: ['IT', 'Maths'],
    folders: ['04 - Primary 4'],
    classesPerWeek: 3,
    defaultBook: 'Oxford Keyboard / Computing Book 4',
    defaultBookFile: 'downloads/p4/P4_T1_Maths_CT1.pdf',
    defaultHwFile: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
    defaultAnswerFile: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.docx',
    weeks: [
      {
        week: 1,
        title: 'Spreadsheet Essentials - Intro to MS Excel',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4 - Chapter 3',
            pages: 'Pages 22–24',
            topic: 'Excel Grid Structure: Workbooks, Sheets, Rows, Columns, Cells',
            inClassActivity: 'Understanding cell addresses (e.g. A1, C5). Navigating with arrow keys and Name Box.',
            homework: 'Solve Worksheet 1: Identify cell addresses from the given grid.',
            diary: 'Read TB Pg 22-24. Complete Cell Address Worksheet.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4 - Chapter 3',
            pages: 'Pages 25–27',
            topic: 'Data Types in Excel (Text, Numbers, Dates) & AutoFill Handle',
            inClassActivity: 'Entering labels vs numeric data. Dragging AutoFill handle for Days of Week and Months.',
            homework: 'Create a spreadsheet table with 5 items and their prices.',
            diary: 'Practice AutoFill handle in Excel at home.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4 - Chapter 3',
            pages: 'Pages 28–30',
            topic: 'Cell Formatting, Column Width & Gridlines',
            inClassActivity: 'Adjusting row heights and column widths. Merging header cells across columns.',
            homework: 'Complete Formatting Task Sheet Q1-Q4.',
            diary: 'Read TB Pg 28-30. Review column auto-fit steps.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 2,
        title: 'Basic Formulas in Excel (SUM, AVERAGE, MIN, MAX)',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4 - Chapter 4',
            pages: 'Pages 31–33',
            topic: 'Formula Syntax & The Equals Sign (=)',
            inClassActivity: 'Writing arithmetic formulas: Addition (=A1+B1), Subtraction, Multiplication (*), and Division (/).',
            homework: 'Write 4 formulas calculating grocery costs in notebook.',
            diary: 'Read TB Pg 31-33. Always start formulas with =.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4 - Chapter 4',
            pages: 'Pages 34–36',
            topic: '=SUM() and =AVERAGE() Built-in Functions',
            inClassActivity: 'Using =SUM(B2:B10) to total student test scores. Calculating averages with =AVERAGE().',
            homework: 'Solve Spreadsheet Worksheet Task B (Total & Average calculation).',
            diary: 'Complete SUM and AVERAGE calculations on worksheet.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4 - Chapter 4',
            pages: 'Pages 37–39',
            topic: '=MIN() and =MAX() Functions & Marksheet Project',
            inClassActivity: 'Finding highest mark with =MAX() and lowest mark with =MIN(). Building a full student grade sheet.',
            homework: 'Complete Marksheet project Q1-Q5.',
            diary: 'Practice =MIN() and =MAX() functions in Excel.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 3,
        title: 'Charts & Data Visualization in MS Excel',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4 - Chapter 5',
            pages: 'Pages 40–42',
            topic: 'Types of Charts: Column, Bar & Pie Charts',
            inClassActivity: 'Selecting table data range and inserting a 2D Column Chart. Explaining when to use Bar vs Pie charts.',
            homework: 'Match chart types with scenarios on workbook page 41.',
            diary: 'Read TB Pg 40-42 on Chart types in Excel.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4 - Chapter 5',
            pages: 'Pages 43–45',
            topic: 'Chart Elements: Titles, Legend & Axis Labels',
            inClassActivity: 'Customizing chart titles, adding X/Y axis labels, and positioning the Legend box.',
            homework: 'Complete Chart Elements Worksheet.',
            diary: 'Practice adding Titles and Labels to charts.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4 - Chapter 5',
            pages: 'Pages 46–48',
            topic: 'Data Analysis Lab: Visualizing Class Survey Data',
            inClassActivity: 'Surveying students on favorite sports and generating a 3D Pie Chart with data percentage callouts.',
            homework: 'Draw a pie chart based on your daily hobby hours.',
            diary: 'Complete Chart lab assignment.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Paper Solving',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4',
            pages: 'Chapters 3, 4 & 5',
            topic: 'Comprehensive Review of Excel Formulas & Formatting',
            inClassActivity: 'Formula syntax drill on the board. Reviewing common formula errors (#VALUE!, #DIV/0!).',
            homework: 'Revise Excel formulas and cell referencing for CT 1.',
            diary: 'Study for Class Test 1 (CT 1) next week.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/P4_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p4/P4_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4',
            pages: 'CT 1 Model Paper',
            topic: 'Solving CT 1 Past Exam Paper (Part 1 - 35 Marks)',
            inClassActivity: 'Timed solving of past paper under exam conditions. Individual error review.',
            homework: 'Complete CT 1 Part 1 paper corrections.',
            diary: 'Solve CT 1 model paper at home.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4',
            pages: 'CT 1 Model Paper Part 2',
            topic: 'Solving Practical & Objective Sections',
            inClassActivity: 'Marking scheme breakdown and answering techniques for full marks.',
            homework: 'Final revision for CT 1 exam next week.',
            diary: 'CT 1 exam next week! Review all formulas.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & PowerPoint Intro',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (35 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written examination.',
            homework: 'Read Page 50: Introduction to MS PowerPoint.',
            diary: 'CT 1 completed today! Read TB Pg 50.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            hwFileUrl: 'downloads/p4/P4_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p4/P4_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4 - Chapter 6',
            pages: 'Pages 50–53',
            topic: 'PowerPoint Interface: Slides, Placeholders & Layouts',
            inClassActivity: 'Creating a new presentation. Inserting Title slide and Title & Content slides. Applying Themes.',
            homework: 'Plan a 3-slide presentation outline on "Endangered Animals" in your copy.',
            diary: 'Read TB Pg 50-53 on PowerPoint layout tools.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4 - Chapter 6',
            pages: 'Pages 54–56',
            topic: 'Inserting Shapes, Images & Formatting Text',
            inClassActivity: 'Adding pictures from device. Aligning images and using WordArt for headings.',
            homework: 'Design slide 1 and slide 2 on your computer.',
            diary: 'Practice adding images in PowerPoint.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 6,
        title: 'Transitions & Custom Animations in PowerPoint',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4 - Chapter 7',
            pages: 'Pages 57–59',
            topic: 'Slide Transitions (Fade, Wipe, Push, Reveal)',
            inClassActivity: 'Applying different transition effects between slides. Setting slide timings and transition sound.',
            homework: 'Complete Worksheet on Slide Transitions.',
            diary: 'Read TB Pg 57-59. Practice slide transitions.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4 - Chapter 7',
            pages: 'Pages 60–62',
            topic: 'Custom Animations (Entrance, Emphasis, Exit Effects)',
            inClassActivity: 'Animating text and bullet points one-by-one. Reordering animation sequence in Animation Pane.',
            homework: 'Add entrance animation to all bullets in your project presentation.',
            diary: 'Practice Animation Pane and effects.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4 - Chapter 7',
            pages: 'Pages 63–65',
            topic: 'Running Slide Shows (F5) & Rehearse Timings',
            inClassActivity: 'Fullscreen presentation mode. Using presenter tools, laser pointer, and pen markup.',
            homework: 'Rehearse your presentation at home for 2 minutes.',
            diary: 'Rehearse 3-slide presentation.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & CA1 Paper 2 Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Computing Book 4',
            pages: 'Chapters 6 & 7',
            topic: 'PowerPoint Features, Transitions & Shortcuts Revision',
            inClassActivity: 'Rapid question session on animation types and presentation shortcuts.',
            homework: 'Revise Chapters 6 & 7 for Class Test 2 (CT 2).',
            diary: 'Study for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Computing Book 4',
            pages: 'CT 2 Model Paper',
            topic: 'Solving CT 2 Model Exam Paper',
            inClassActivity: 'Solving 35-mark sample paper under timed conditions in class.',
            homework: 'Complete CT 2 mock paper review.',
            diary: 'CT 2 next week! Revise all definitions.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.docx',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.docx',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Computing Book 4',
            pages: 'Final Review',
            topic: 'Doubt Clearing & Formula Consolidation',
            inClassActivity: 'Clearing all remaining student doubts on Excel formulas and PowerPoint animations.',
            homework: 'Final exam revision.',
            diary: 'Prepare well for CT 2 exam.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Student Presentations',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (35 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students take the CT 2 written exam.',
            homework: 'Prepare your PowerPoint slides for classroom presentation.',
            diary: 'CT 2 exam completed today.',
            bookPageUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Presentation Session',
            pages: 'Project Showcase',
            topic: 'Student Project Presentations - Group A',
            inClassActivity: 'Students present their 3-slide presentations on the lab projector screen.',
            homework: 'Group B students prepare for their turn.',
            diary: 'Presentation Day 1 completed.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_1_Answer_Key__30_5_35_Marks_.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Presentation Session',
            pages: 'Project Showcase',
            topic: 'Student Project Presentations - Group B & Feedback',
            inClassActivity: 'Remaining student presentations followed by teacher constructive feedback and grading.',
            homework: 'Enjoy your term break!',
            diary: 'Term 2 presentations concluded successfully.',
            bookPageUrl: 'downloads/p4/P4_T1_Maths_CT1.pdf',
            hwFileUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Question_Paper__30_5_35_Marks_.pdf',
            answerKeyUrl: 'downloads/p4/Primary4_IT_CA1_Part_2_Answer_Key__30_5_35_Marks_.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'p6',
    name: 'Primary 6',
    code: 'P6',
    grade: 'Primary Level 6',
    icon: '📙',
    subjects: ['IT (MS Access & OpenOffice)'],
    folders: ['05 - Primary 6'],
    classesPerWeek: 3,
    defaultBook: 'MS Access & OpenOffice Base Master Course',
    defaultBookFile: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
    defaultHwFile: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
    defaultAnswerFile: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf',
    weeks: [
      {
        week: 1,
        title: 'Database Architecture - Relational Databases & Fields',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide - Chapter 1',
            pages: 'Pages 14–17',
            topic: 'What is a Database? Flat File vs Relational Database',
            inClassActivity: 'Comparing Excel spreadsheets (flat file) with Relational Databases (MS Access). Understanding Tables, Records (rows), and Fields (columns).',
            homework: 'Read TB Pages 14-17. Define Field, Record, and Database in your notebook.',
            diary: 'Read TB Pg 14-17. Define Field, Record, and Database.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'MS Access Master Guide - Chapter 1',
            pages: 'Pages 18–21',
            topic: 'MS Access Interface: Navigation Pane & Objects',
            inClassActivity: 'Exploring 4 major Access objects: Tables (store), Queries (search), Forms (input), Reports (print).',
            homework: 'Complete Worksheet Task 1 on Access Objects.',
            diary: 'List 4 objects of MS Access and their uses in copy.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'MS Access Master Guide - Chapter 1',
            pages: 'Pages 22–25',
            topic: 'Creating a Database in Design View',
            inClassActivity: 'Hands-on lab: Creating a new blank database named "SchoolLibrary". Designing a "Books" table in Design View.',
            homework: 'Draft field names for a "StudentProfiles" table on paper.',
            diary: 'Read TB Pg 22-25 on Table Design View.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          }
        ]
      },
      {
        week: 2,
        title: 'Data Types & Primary Key Rules in MS Access',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide - Chapter 2',
            pages: 'Pages 26–29',
            topic: 'Data Types: Short Text, Number, Date/Time, Currency, AutoNumber, Yes/No',
            inClassActivity: 'Choosing appropriate data types for fields (e.g. Phone number as Text vs Quantity as Number).',
            homework: 'Complete Worksheet on Data Type Selection.',
            diary: 'Read TB Pg 26-29. Match fields with correct Data Types.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'MS Access Master Guide - Chapter 2',
            pages: 'Pages 30–33',
            topic: 'The Primary Key Concept & Uniqueness Constraint',
            inClassActivity: 'What is a Primary Key? Why duplicate IDs are rejected by Access. Setting Primary Key on StudentID field.',
            homework: 'Write 3 real-world examples of primary keys (NID, Passport No, Student Roll).',
            diary: 'Define Primary Key and its 2 main properties.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'MS Access Master Guide - Chapter 2',
            pages: 'Pages 34–37',
            topic: 'Field Properties: Field Size, Format & Required Fields',
            inClassActivity: 'Configuring Field Size limits (preventing memory waste) and setting Required = Yes for essential data.',
            homework: 'Complete Field Properties Practice Sheet.',
            diary: 'Practice setting Field Size in Access at home.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          }
        ]
      },
      {
        week: 3,
        title: 'Data Entry, Sorting & Filtering in Datasheet View',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide - Chapter 3',
            pages: 'Pages 38–41',
            topic: 'Entering & Editing Records in Datasheet View',
            inClassActivity: 'Entering 10 student records into table. Navigating records using Record Navigation Bar at bottom.',
            homework: 'Read TB Pg 38-41. Note shortcut keys for record navigation.',
            diary: 'Read TB Pg 38-41 on Datasheet View.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'MS Access Master Guide - Chapter 3',
            pages: 'Pages 42–44',
            topic: 'Sorting Records (Ascending / Descending) & Quick Filter',
            inClassActivity: 'Sorting records alphabetically by Last Name. Applying Filter by Selection to show only Grade 6 students.',
            homework: 'Complete Sorting & Filtering Task Sheet.',
            diary: 'Complete Worksheet on Sorting and Filters.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'MS Access Master Guide - Chapter 3',
            pages: 'Pages 45–48',
            topic: 'Forms Creation using Form Wizard',
            inClassActivity: 'Using Form Wizard to build a clean user interface for data entry. Adding navigation and record save buttons.',
            homework: 'Design a mock layout for a Book Borrowing Form in your copy.',
            diary: 'Practice creating a Form using Form Wizard.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Past Paper Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide',
            pages: 'Chapters 1, 2 & 3',
            topic: 'Comprehensive Review of Databases, Data Types & Primary Keys',
            inClassActivity: 'Rapid question fire on Primary Keys, Data Types, and Access Interface. Addressing individual doubts.',
            homework: 'Revise all notes for Class Test 1 (CT 1) next week.',
            diary: 'Study Chapters 1-3 thoroughly for Class Test 1 (CT 1).',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Model Paper',
            topic: 'Solving CT 1 Sample Paper (35 Marks)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme discussion.',
            homework: 'Complete CT 1 sample paper corrections.',
            diary: 'Solve CT 1 model paper at home.',
            bookPageUrl: 'downloads/p6/P6_T1_CT_1_IT.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_1_IT.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Practical Guide',
            pages: 'Lab Mock Exam',
            topic: 'Hands-on Table Design Mock Test',
            inClassActivity: '15-minute practical challenge: Creating table, choosing data types, and setting primary key under timed supervision.',
            homework: 'Final revision for CT 1 exam next week.',
            diary: 'CT 1 exam next week! Review all definitions and steps.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_1_IT_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Queries in MS Access',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (35 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written examination under exam conditions.',
            homework: 'Read Page 50: Introduction to Queries in MS Access.',
            diary: 'CT 1 completed today! Read TB Pg 50.',
            bookPageUrl: 'downloads/p6/P6_T1_CT_1_IT.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_1_IT.docx',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_1_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'MS Access Master Guide - Chapter 4',
            pages: 'Pages 50–53',
            topic: 'Query Design View & The Criteria Row',
            inClassActivity: 'What is a Query? Using Query Design View to select specific fields and filter records using criteria (e.g. City = "Dhaka").',
            homework: 'Write 3 query criteria examples in your copy.',
            diary: 'Read TB Pg 50-53 on Query Design View.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'MS Access Master Guide - Chapter 4',
            pages: 'Pages 54–57',
            topic: 'Comparison Operators in Queries (>, <, >=, <=, <>)',
            inClassActivity: 'Filtering numbers: Finding all books with Price > 500 or students with Marks >= 80.',
            homework: 'Complete Query Criteria Worksheet Task B.',
            diary: 'Complete Worksheet on Comparison Operators.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          }
        ]
      },
      {
        week: 6,
        title: 'Logical Operators (AND / OR) & Reports Generation',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide - Chapter 5',
            pages: 'Pages 58–61',
            topic: 'Logical Operators (AND, OR, NOT) in Query Grid',
            inClassActivity: 'Multiple criteria on the same row (AND) vs separate rows (OR). Wildcard searches with Like "A*".',
            homework: 'Complete Worksheet on Logical Operators.',
            diary: 'Read TB Pg 58-61 on AND/OR criteria.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'MS Access Master Guide - Chapter 5',
            pages: 'Pages 62–65',
            topic: 'Generating Reports using Report Wizard',
            inClassActivity: 'Why use Reports? Professional print layouts, Grouping by Class/Department, Summary options (Sum, Avg).',
            homework: 'Read TB Pg 62-65. Note down Report Wizard steps.',
            diary: 'Practice creating a Report using Report Wizard.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_IT_-_Classroom_Practice_Worksheet_1_-_Answer_Sheet.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'MS Access Master Guide - Chapter 5',
            pages: 'Pages 66–68',
            topic: 'Formatting Reports & Exporting to PDF',
            inClassActivity: 'Customizing report headers, adding school logo, and exporting final report as a PDF document.',
            homework: 'Complete Report Design Task Sheet.',
            diary: 'Export sample report to PDF at home.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & Model Paper Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'MS Access Master Guide',
            pages: 'Chapters 4 & 5',
            topic: 'Queries, Criteria & Reports Comprehensive Review',
            inClassActivity: 'Reviewing query criteria writing and common mistakes in wildcard syntax. Solving practice paper.',
            homework: 'Revise Chapters 4 & 5 for Class Test 2 (CT 2).',
            diary: 'Study for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_2_IT.docx',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_2_IT_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Model Paper',
            topic: 'Solving CT 2 Model Examination (35 Marks)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme discussion.',
            homework: 'Complete CT 2 mock paper corrections.',
            diary: 'Solve CT 2 model paper at home.',
            bookPageUrl: 'downloads/p6/P6_T1_CT_2_IT.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_2_IT.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_2_IT_-_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Practical Guide',
            pages: 'Lab Mock Exam 2',
            topic: 'Hands-on Query & Report Practical Mock Test',
            inClassActivity: 'Lab challenge: Building 2 custom queries and generating a grouped report within 20 minutes.',
            homework: 'Final exam revision.',
            diary: 'CT 2 exam next week! Review all query criteria.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Study_Material.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_2_IT.docx',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_2_IT_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Final Database Project',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (35 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students take the CT 2 written exam under exam conditions.',
            homework: 'Prepare your final database project files for submission.',
            diary: 'CT 2 exam completed today.',
            bookPageUrl: 'downloads/p6/P6_T1_CT_2_IT.pdf',
            hwFileUrl: 'downloads/p6/P6_T1_CT_2_IT.pdf',
            answerKeyUrl: 'downloads/p6/P6_T1_CT_2_IT_-_Answer_Key.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Project Guide Sheet',
            pages: 'Capstone Evaluation',
            topic: 'Final Database System Demonstration & Testing',
            inClassActivity: 'Students demonstrate their complete School Database system (Tables, Forms, Queries, Reports) on screen.',
            homework: 'Document project notes.',
            diary: 'Project Demo Day 1 concluded.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Project Guide Sheet',
            pages: 'Grading & Debrief',
            topic: 'Teacher Feedback & Term 2 Project Grading',
            inClassActivity: 'Teacher evaluation, awards for top database architectures, and term completion recap.',
            homework: 'Enjoy your term break!',
            diary: 'Term 2 Database Capstone successfully completed.',
            bookPageUrl: 'downloads/p6/P6_Chapter_1_MS_Access_Part2_Comprehensive_Study_Guide___Practice_Workbook.pdf',
            hwFileUrl: 'downloads/p6/P6_IT_Workbook_Term1_Student_Version.pdf',
            answerKeyUrl: 'downloads/p6/P6_IT_Workbook_Term1_Teacher_Answer_Key.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'sec1',
    name: 'Secondary 1 (Sec 1)',
    code: 'Sec 1',
    grade: 'Secondary Grade 7',
    icon: '🎓',
    subjects: ['Computer Science'],
    folders: ['06 - Secondary 1 (Sec 1)'],
    classesPerWeek: 3,
    defaultBook: 'Cambridge IGCSE & O Level Computer Science (2nd Edition)',
    defaultBookFile: 'downloads/sec1/Sec1_IT_Term2_Comprehensive_Study_Material.pdf',
    defaultHwFile: 'downloads/sec1/Sec1_IT_Term2_Comprehensive_Worksheet.pdf',
    defaultAnswerFile: 'downloads/sec1/Sec1_IT_Term2_Comprehensive_Worksheet_Answer_Key.pdf',
    term2Weeks: sec1Term2Weeks,
    term1Weeks: [
      {
        week: 1,
        title: 'Data Representation - Binary, Denary & Hexadecimal Systems',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7 - Chapter 1',
            pages: 'Pages 2–6',
            topic: 'Binary System (Base 2): Bits, Bytes & Place Values',
            inClassActivity: 'Understanding binary place values (128, 64, 32, 16, 8, 4, 2, 1). Converting Denary numbers to 8-bit Binary numbers.',
            homework: 'Convert 10 denary numbers (45, 78, 129, 210, etc.) to 8-bit binary.',
            diary: 'Read TB Pg 2-6. Complete 10 Binary conversion problems.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 7 - Chapter 1',
            pages: 'Pages 7–10',
            topic: 'Binary Addition & Overflow Error Concept',
            inClassActivity: 'Rules of binary addition: 0+0=0, 0+1=1, 1+1=10, 1+1+1=11. Demonstrating 8-bit overflow errors.',
            homework: 'Solve 6 binary addition problems on worksheet.',
            diary: 'Read TB Pg 7-10 on Binary Addition and Overflow.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 7 - Chapter 1',
            pages: 'Pages 11–15',
            topic: 'Hexadecimal Numbers (Base 16: 0-9, A-F)',
            inClassActivity: 'Why programmers use Hex (shorter representation, easier to read). Splitting 8-bit binary into two 4-bit nibbles for Hex conversion.',
            homework: 'Complete Hexadecimal conversion worksheet Q1-Q8.',
            diary: 'Practice Binary to Hexadecimal conversions.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 2,
        title: 'File Size Calculations - Text, Sound & Images',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7 - Chapter 2',
            pages: 'Pages 16–19',
            topic: 'Text Representation: ASCII (7/8-bit) & Unicode (16/32-bit)',
            inClassActivity: 'Calculating text file sizes: Number of characters x bits per character / 8 = Bytes. Converting Bytes to KB.',
            homework: 'Calculate the size of a 500-word paragraph in ASCII and Unicode.',
            diary: 'Read TB Pg 16-19. Complete Text Size problems 1-4.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 7 - Chapter 2',
            pages: 'Pages 20–23',
            topic: 'Image File Size Formula: Resolution x Colour Depth',
            inClassActivity: 'Formula: Width (px) x Height (px) x Colour Depth (bpp) / 8 / 1024 = KB. Impact of 24-bit True Colour vs 8-bit.',
            homework: 'Solve Image Calculation problems 1-5 on worksheet.',
            diary: 'Read TB Pg 20-23. Memorize image size formula.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 7 - Chapter 2',
            pages: 'Pages 24–27',
            topic: 'Sound File Size: Sample Rate x Sample Resolution x Duration',
            inClassActivity: 'Calculating audio sizes for mono and stereo channels. Converting Hz to seconds and bytes to MB.',
            homework: 'Complete Sound file size worksheet calculations.',
            diary: 'Solve Sound file calculation practice sheet.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'Data Compression - Lossless vs Lossy Algorithms',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7 - Chapter 3',
            pages: 'Pages 28–31',
            topic: 'Why Compress? Storage & Transmission Bandwidth',
            inClassActivity: 'Analyzing network download times for uncompressed vs compressed files. Introduction to compression ratio.',
            homework: 'Write 3 real-world reasons why streaming services compress video and audio.',
            diary: 'Read TB Pg 28-31 on Data Compression reasons.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 7 - Chapter 3',
            pages: 'Pages 32–35',
            topic: 'Lossless Compression: Run Length Encoding (RLE)',
            inClassActivity: 'Step-by-step encoding of repeated character sequences and 2-color bitmapped images using RLE.',
            homework: 'Encode 4 sample text strings using Run Length Encoding.',
            diary: 'Complete RLE worksheet problems 1-6.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 7 - Chapter 3',
            pages: 'Pages 36–39',
            topic: 'Lossy Compression (JPEG, MP3, MP4) & Trade-offs',
            inClassActivity: 'Comparing JPEG artifacts and original TIFF files. When lossy compression is acceptable vs when lossless is mandatory.',
            homework: 'Complete comparison table between Lossy and Lossless compression.',
            diary: 'Write comparison table between Lossy and Lossless.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Cambridge Paper Solving',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7',
            pages: 'Chapters 1, 2 & 3',
            topic: 'Formula Recap & Number Systems Review',
            inClassActivity: 'Reviewing all formulas: Text, Sound, Image calculations. Clearing student doubts under teacher supervision.',
            homework: 'Revise all formula sheets for Class Test 1 (CT 1).',
            diary: 'Study Chapters 1-3 thoroughly for Class Test 1 (CT 1).',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Past Papers',
            pages: 'CT 1 Past Paper (35 Marks)',
            topic: 'Timed Solving of CT 1 Question Paper (Part 1)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme walkthrough.',
            homework: 'Complete CT 1 Part 1 paper corrections.',
            diary: 'Solve CT 1 past paper Part 1 at home.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Past Papers',
            pages: 'CT 1 Past Paper (Part 2)',
            topic: 'Timed Solving of CT 1 Question Paper (Part 2)',
            inClassActivity: 'Focusing on 4-mark explain questions and calculation step markings.',
            homework: 'Final revision for CT 1 exam next week.',
            diary: 'CT 1 exam next week! Review all formulas and steps.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Computer Networks Intro',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (35 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written examination under formal exam conditions.',
            homework: 'Read Page 40: Introduction to Computer Networks.',
            diary: 'CT 1 completed today! Read TB Pg 40.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 7 - Chapter 4',
            pages: 'Pages 40–43',
            topic: 'LAN vs WAN & Client-Server vs Peer-to-Peer Models',
            inClassActivity: 'Comparing Local Area Networks with Wide Area Networks (Internet). Centralized server control vs P2P file sharing.',
            homework: 'Complete Worksheet on Network Models.',
            diary: 'Read TB Pg 40-43. Compare LAN and WAN.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 7 - Chapter 4',
            pages: 'Pages 44–47',
            topic: 'Network Topologies: Star, Bus, Mesh & Ring',
            inClassActivity: 'Drawing network topologies. Analyzing single point of failure and cable costs for each topology.',
            homework: 'Draw Star and Mesh topology diagrams with advantages in copy.',
            diary: 'Draw Star and Mesh topology diagrams in copy.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Network Hardware & Data Transmission Modes',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7 - Chapter 5',
            pages: 'Pages 48–51',
            topic: 'Network Devices: Router, Switch, NIC, WAP',
            inClassActivity: 'Inspecting school router and switch. Explaining how MAC addresses are used by switches and IP addresses by routers.',
            homework: 'Complete Worksheet on Network Devices.',
            diary: 'Read TB Pg 48-51 on Network Hardware.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 7 - Chapter 5',
            pages: 'Pages 52–55',
            topic: 'Transmission Media: Twisted Pair, Coaxial & Fibre Optic Cables',
            inClassActivity: 'Comparing speed, bandwidth, attenuation, and interference across copper cables vs pulses of light in glass fiber.',
            homework: 'Write 4 benefits of Fibre Optic over Copper cables.',
            diary: 'Compare Copper vs Fibre Optic cables in notebook.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 7 - Chapter 5',
            pages: 'Pages 56–59',
            topic: 'Data Transmission: Simplex, Half-Duplex & Full-Duplex',
            inClassActivity: 'Real life examples: Keyboard/Monitor (Simplex), Walkie-Talkie (Half-Duplex), Telephone Call (Full-Duplex).',
            homework: 'Complete Transmission Modes Worksheet.',
            diary: 'Complete Worksheet on Transmission Modes.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & CA1 Paper Drill',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 7',
            pages: 'Chapters 4 & 5',
            topic: 'Networks & Transmission Modes Comprehensive Review',
            inClassActivity: 'Solving past exam questions on network hardware and topologies in teams.',
            homework: 'Revise Chapters 4 & 5 for Class Test 2 (CT 2).',
            diary: 'Study for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Model Paper Part 1',
            topic: 'Timed Solving of CT 2 Model Examination (35 Marks)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme discussion.',
            homework: 'Complete CT 2 mock paper corrections.',
            diary: 'Solve CT 2 model paper at home.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Model Paper Part 2',
            topic: 'Mark Scheme Analysis & Keyword Drilling',
            inClassActivity: 'Identifying keywords that examiners look for in network definitions.',
            homework: 'Final exam revision.',
            diary: 'CT 2 exam next week! Review all definitions.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Network Design Challenge',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (35 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students take the CT 2 written exam under exam supervision.',
            homework: 'Prepare for practical network planning lab.',
            diary: 'CT 2 exam completed today.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Lab Project Guide',
            pages: 'Practical Network Plan',
            topic: 'Designing a School Computer Lab Network',
            inClassActivity: 'Hands-on task: Students design a 30-computer star topology network with switch, router, and firewall specifications.',
            homework: 'Finalize network blueprint diagram.',
            diary: 'Network design lab completed.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Lab Project Guide',
            pages: 'Debrief & Awards',
            topic: 'Project Review & Term 2 Performance Awards',
            inClassActivity: 'Teacher evaluation of network plans, exam paper debrief, and congratulations for Term 2 achievements.',
            homework: 'Enjoy your term break!',
            diary: 'Term 2 concluded successfully.',
            bookPageUrl: 'downloads/sec1/Sec_1_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec1/Sec_1_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      }
    ]
  },
  {
    id: 'sec2',
    name: 'Secondary 2 (Sec 2)',
    code: 'Sec 2',
    grade: 'Secondary Grade 8',
    icon: '🚀',
    subjects: ['Computer Science'],
    folders: ['07 - Secondary 2 (Sec 2)'],
    classesPerWeek: 3,
    defaultBook: 'Cambridge IGCSE & O Level Computer Science (2nd Edition)',
    defaultBookFile: 'downloads/sec2/Sec2_IT_Term2_Comprehensive_Study_Material.pdf',
    defaultHwFile: 'downloads/sec2/Sec2_IT_Term2_Comprehensive_Worksheet.pdf',
    defaultAnswerFile: 'downloads/sec2/Sec2_IT_Term2_Comprehensive_Worksheet_Answer_Key.pdf',
    term2Weeks: sec2Term2Weeks,
    term1Weeks: [
      {
        week: 1,
        title: 'Von Neumann Architecture & The Fetch-Decode-Execute Cycle',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8 - Chapter 1',
            pages: 'Pages 18–22',
            topic: 'Von Neumann Principles: Stored Program Concept & CPU Registers',
            inClassActivity: 'Explaining stored program concept. Roles of MAR (Memory Address Register), MDR (Memory Data Register), PC (Program Counter), and ACC (Accumulator).',
            homework: 'Read TB Pages 18-22. Define the role of PC, MAR, MDR, and ACC in your notebook.',
            diary: 'Read TB Pg 18-22. Define CPU registers in copy.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 1',
            pages: 'Pages 23–26',
            topic: 'The Fetch-Decode-Execute (FDE) Cycle Step-by-Step',
            inClassActivity: 'Tracing data movement between RAM and registers during the 3 stages of FDE cycle. Simulating a machine instruction.',
            homework: 'Write the 5-step FDE cycle description in clear bullet points.',
            diary: 'Read TB Pg 23-26. Describe the FDE cycle steps.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 1',
            pages: 'Pages 27–30',
            topic: 'System Buses: Address Bus, Data Bus & Control Bus',
            inClassActivity: 'Analyzing bus width and direction: Address bus (unidirectional), Data bus (bidirectional), Control bus (signals like Read/Write, Clock).',
            homework: 'Complete System Buses Worksheet Q1-Q6.',
            diary: 'Complete Worksheet on System Buses.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 2,
        title: 'CPU Performance Factors & Logic Gates',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8 - Chapter 2',
            pages: 'Pages 31–34',
            topic: 'Factors Affecting CPU Speed: Clock Speed, Cache Size & Cores',
            inClassActivity: 'How Clock Speed (GHz), Cache size (L1/L2/L3), and Multi-core processors impact instructions processed per second.',
            homework: 'Explain why doubling cores does not always double performance.',
            diary: 'Read TB Pg 31-34 on CPU performance factors.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 2',
            pages: 'Pages 35–38',
            topic: 'Standard Logic Gates: NOT, AND, OR, NAND, NOR, XOR',
            inClassActivity: 'Drawing ANSI symbols and constructing truth tables for 2-input logic gates. Verifying outputs with logic simulation tool.',
            homework: 'Complete Logic Gates Truth Table Sheet.',
            diary: 'Read TB Pg 35-38. Draw symbols for 6 logic gates.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 8 - Chapter 2',
            pages: 'Pages 39–42',
            topic: 'Combining Logic Gates into Multi-Stage Circuits',
            inClassActivity: 'Solving 3-input truth tables from logic expressions e.g. X = (A AND B) OR (NOT C).',
            homework: 'Solve problems on textbook Page 42 in copy.',
            diary: 'Complete Truth Tables on textbook page 42.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'Operating Systems & System Software Functions',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8 - Chapter 3',
            pages: 'Pages 43–46',
            topic: 'Core Functions of an OS: Memory Management & Multitasking',
            inClassActivity: 'How OS manages virtual memory, paging, and process scheduling in modern multitasking systems.',
            homework: 'Write 4 main functions of an Operating System in your notebook.',
            diary: 'Read TB Pg 43-46 on Operating System roles.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 3',
            pages: 'Pages 47–50',
            topic: 'User Interfaces: CLI vs GUI Comparison',
            inClassActivity: 'Comparing Command Line Interface (CLI) speed, low RAM usage, and scripting with Graphical User Interface (GUI) user friendliness.',
            homework: 'Complete CLI vs GUI comparison table.',
            diary: 'Read TB Pg 47-50 on CLI vs GUI.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 8 - Chapter 3',
            pages: 'Pages 51–54',
            topic: 'Utility Software: Defragmentation, Antivirus, Backup',
            inClassActivity: 'Explaining disk fragmentation and how defragmenter reorganizes non-contiguous blocks on HDDs.',
            homework: 'Complete Utility Software Worksheet.',
            diary: 'Complete Worksheet on Utility Software.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Past Paper Solving',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8',
            pages: 'Chapters 1, 2 & 3',
            topic: 'Von Neumann, Logic Gates & OS Comprehensive Review',
            inClassActivity: 'Circuit solving drill on the board. Reviewing register definitions and FDE steps.',
            homework: 'Revise all notes for Class Test 1 (CT 1) next week.',
            diary: 'Study Chapters 1-3 thoroughly for Class Test 1 (CT 1).',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Past Paper (35 Marks)',
            topic: 'Timed Solving of CT 1 Question Paper (Part 1)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme discussion.',
            homework: 'Complete CT 1 Part 1 paper corrections.',
            diary: 'Solve CT 1 past paper Part 1 at home.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Past Paper (Part 2)',
            topic: 'Timed Solving of CT 1 Question Paper (Part 2)',
            inClassActivity: 'Focusing on logic circuit diagram drawing and bus specification questions.',
            homework: 'Final revision for CT 1 exam next week.',
            diary: 'CT 1 exam next week! Review all circuits and registers.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Cybersecurity Intro',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (35 Marks)',
            topic: 'Conducting Class Test 1 (CT 1) Examination',
            inClassActivity: 'Students take the CT 1 written examination.',
            homework: 'Read Page 55: Introduction to Cybersecurity.',
            diary: 'CT 1 completed today! Read TB Pg 55.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 4',
            pages: 'Pages 55–58',
            topic: 'Malware Types: Viruses, Worms, Trojans, Spyware, Ransomware',
            inClassActivity: 'Differentiating how malware infects and replicates. Real world case study of WannaCry Ransomware.',
            homework: 'Complete Malware Identification Worksheet.',
            diary: 'Read TB Pg 55-58 on Malware threats.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 8 - Chapter 4',
            pages: 'Pages 59–62',
            topic: 'Social Engineering: Phishing, Pharming & Shoulder Surfing',
            inClassActivity: 'Analyzing fake phishing emails in class. Spotting fraudulent URLs and spelling errors.',
            homework: 'Write 4 red flags to identify phishing emails.',
            diary: 'Write 4 signs of phishing emails in notebook.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Cyber Defense Mechanisms & Cryptography',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8 - Chapter 5',
            pages: 'Pages 63–66',
            topic: 'Defense Layers: Firewalls, Proxies & Antivirus Software',
            inClassActivity: 'How packet filtering firewalls inspect incoming and outgoing packets. Role of proxy servers in school filtering.',
            homework: 'Complete Worksheet on Network Security Defenses.',
            diary: 'Read TB Pg 63-66 on Firewalls and Proxies.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Computing 8 - Chapter 5',
            pages: 'Pages 67–70',
            topic: 'Authentication: Strong Passwords, 2FA & Biometrics',
            inClassActivity: 'Testing password entropy. How Two-Factor Authentication (OTP) prevents unauthorized access even if password is leaked.',
            homework: 'Evaluate your home account security and list 2FA methods used.',
            diary: 'Read TB Pg 67-70 on 2FA and Biometrics.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Computing 8 - Chapter 5',
            pages: 'Pages 71–74',
            topic: 'Encryption: Plaintext, Ciphertext & Symmetric vs Asymmetric',
            inClassActivity: 'Hands-on Caesar Cipher decryption lab. Basic concept of Public and Private keys in HTTPS web browsing.',
            homework: 'Decrypt the 2 encrypted secret messages on worksheet.',
            diary: 'Complete Encryption worksheet problems.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & CA1 Consolidation',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Computing 8',
            pages: 'Chapters 4 & 5',
            topic: 'Cyber Threats & Defense Mechanisms Comprehensive Review',
            inClassActivity: 'Past exam questions on malware classification and defense methods.',
            homework: 'Revise Chapters 4 & 5 for Class Test 2 (CT 2).',
            diary: 'Study for Class Test 2 (CT 2) next week.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Model Paper Part 1',
            topic: 'Timed Solving of CT 2 Model Examination (35 Marks)',
            inClassActivity: 'Timed solving of 35-mark sample paper in class. Marking scheme discussion.',
            homework: 'Complete CT 2 mock paper corrections.',
            diary: 'Solve CT 2 model paper at home.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Model Paper Part 2',
            topic: 'Mark Scheme Walkthrough & Keyword Precision',
            inClassActivity: 'Teaching students how Cambridge examiners award marks for security risk analysis.',
            homework: 'Final exam revision.',
            diary: 'CT 2 exam next week! Review all definitions.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Cyber Defense Challenge',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (35 Marks)',
            topic: 'Conducting Class Test 2 (CT 2) Examination',
            inClassActivity: 'Students sit for the CT 2 written exam under exam supervision.',
            homework: 'Prepare for security audit workshop.',
            diary: 'CT 2 exam completed today.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Lab Case Study',
            pages: 'Security Audit',
            topic: 'Cybersecurity Audit Simulation in Lab',
            inClassActivity: 'Students analyze a vulnerable company network scenario and propose a 5-point hardening plan.',
            homework: 'Finalize security audit report.',
            diary: 'Cyber audit simulation completed.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Lab Case Study',
            pages: 'Debrief & Term Wrap',
            topic: 'Project Presentations & Term 2 Honors',
            inClassActivity: 'Student presentation of security hardening blueprints, exam debrief, and Term 2 celebration.',
            homework: 'Enjoy your term break!',
            diary: 'Term 2 completed successfully.',
            bookPageUrl: 'downloads/sec2/Sec_2_CT_1_Exam_Revision___Preparation_Guide.pdf',
            hwFileUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science.docx',
            answerKeyUrl: 'downloads/sec2/Sec_2_T1_CT_1_Computer_Science_-_Answer_Key.docx'
          }
        ]
      }
    ]
  },
  {
    id: 'olevel',
    name: 'O Level Computer Science',
    code: 'O-Level',
    grade: 'Cambridge IGCSE & O Level (2210 / 0478)',
    icon: '🏆',
    subjects: ['Computer Science (2023-2026 Syllabus)'],
    folders: ['08 - O Level Computer Science (2023-2026)'],
    classesPerWeek: 4,
    defaultBook: 'Cambridge IGCSE & O Level Computer Science 2nd Edition',
    defaultBookFile: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
    defaultHwFile: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Worksheet.pdf',
    defaultAnswerFile: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf',
    weeks: [
      {
        week: 1,
        title: 'Topic 2: Data Transmission Methods & Error Checking',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 52–56',
            topic: 'Data Packets: Header, Payload & Trailer Structure',
            inClassActivity: 'Dissecting data packet components: IP addresses, sequence numbers, checksum. Packet switching simulation.',
            homework: 'Cambridge Past Paper Topic 2.1: Solve Questions 1 to 5.',
            diary: 'Read Coursebook Pg 52-56. Solve Past Paper Q1-Q5.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Worksheet.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 57–60',
            topic: 'Transmission Methods: Serial vs Parallel & Duplex Modes',
            inClassActivity: 'Comparing Serial vs Parallel transmission (skewing, crosstalk, distance limits). Simplex, Half-duplex, Full-duplex trade-offs.',
            homework: 'Complete Data Transmission Comparison Sheet.',
            diary: 'Read Coursebook Pg 57-60 on Serial vs Parallel.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Worksheet.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 61–63',
            topic: 'Universal Serial Bus (USB) Interface in Cambridge Syllabus',
            inClassActivity: 'Analyzing USB architecture: 4 shielded wires (VBUS, GND, D+, D-), auto-configuration, backwards compatibility, transfer rates.',
            homework: 'Write 4 advantages and 2 limitations of USB in notebook.',
            diary: 'Complete USB evaluation notes in copy.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Study_Material.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 64–68',
            topic: 'Error Detection: Parity Checks (Even/Odd) & Checksums',
            inClassActivity: 'Calculating parity bits and parity blocks (locating transposed bit). Checksum algorithm walkthrough.',
            homework: 'Complete Parity Check Calculation Sheet.',
            diary: 'Solve Parity Block calculation worksheet.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Worksheet.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf'
          }
        ]
      },
      {
        week: 2,
        title: 'Error Checking - ARQ, Check Digits & Topic 10 Logic Gates',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 69–72',
            topic: 'Automatic Repeat Request (ARQ) & Echo Check',
            inClassActivity: 'How ARQ uses positive/negative acknowledgements and timeouts. Echo check limitations (corrupted reverse channel).',
            homework: 'Cambridge Topic 2 Past Paper: Solve Questions 6 to 12.',
            diary: 'Read Coursebook Pg 69-72 on ARQ.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_02_-_Data_Transmission__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_02_-_Data_Transmission__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 73–76',
            topic: 'Check Digits (ISBN 13 & Modulo 11 Calculations)',
            inClassActivity: 'Step-by-step ISBN-13 check digit calculation: multiplying alternating weights (1 and 3), modulo 10 remainder subtraction.',
            homework: 'Calculate check digit for 3 sample ISBNs on worksheet.',
            diary: 'Complete Check Digit calculation exercises.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Worksheet.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_2.1_Data_Transmission_Answer_Key.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 240–245',
            topic: 'Topic 10: Logic Gates & Complex Boolean Circuits',
            inClassActivity: 'Drawing multi-gate circuits from problem descriptions. NOT, AND, OR, NAND, NOR, XOR truth table mastery.',
            homework: 'Complete Logic Gates Question Bank Q1-Q5.',
            diary: 'Read Coursebook Topic 10. Solve Logic Circuits.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_10_-_Boolean_Logic__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_10_-_Boolean_Logic__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 246–250',
            topic: 'Writing Boolean Logic Statements from Circuit Diagrams',
            inClassActivity: 'Reverse engineering logic circuits into Boolean expressions using brackets properly.',
            homework: 'Solve Cambridge past paper logic problems.',
            diary: 'Complete Boolean statement homework.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_10_-_Boolean_Logic__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_10_-_Boolean_Logic__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      },
      {
        week: 3,
        title: 'Hardware - Input & Output Devices & Sensors (Topic 3)',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 80–85',
            topic: 'Sensors in Monitoring vs Control Systems',
            inClassActivity: 'Sensors (Temperature, Moisture, Light, Infrared, Pressure, Acoustic, Gas, pH). ADC converter role. Closed loop feedback systems with actuators.',
            homework: 'Cambridge Topic 3 Question Bank: Solve Q1 to Q8.',
            diary: 'Read Coursebook Topic 3 on Sensors. Solve Q1-Q8.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 86–90',
            topic: 'Output Devices: DLP/LCD Projectors, Actuators & 3D Printers',
            inClassActivity: 'How DLP (micro-mirrors) compares to LCD projectors. 3D printing additive manufacturing process and CAD integration.',
            homework: 'Complete Output Devices Cambridge worksheet.',
            diary: 'Read Coursebook Pg 86-90 on Output Devices.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 91–95',
            topic: 'Primary Storage (RAM vs ROM) & Virtual Memory',
            inClassActivity: 'Volatile RAM vs non-volatile ROM (BIOS). Swapping pages to Virtual Memory on secondary storage.',
            homework: 'Complete RAM vs ROM comparison table in copy.',
            diary: 'Compare RAM and ROM in notebook.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 96–100',
            topic: 'Secondary Storage: Magnetic, Optical & Solid State (SSD)',
            inClassActivity: 'Comparing HDD (platters/heads) vs SSD (NAND flash/floating gate transistors) vs Optical (pits/lands). Speed, durability, cost/GB.',
            homework: 'Solve Cambridge Storage Past Paper Questions.',
            diary: 'Complete Storage past paper problems.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_03_-_Hardware__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      },
      {
        week: 4,
        title: 'Class Test 1 (CT 1) Revision & Cambridge Master Paper',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Topics 1, 2 & 3',
            topic: 'Past Paper Question Drill: Topics 1 & 2',
            inClassActivity: 'Rapid question drill on Number Systems, Data Transmission, and Error Checking with Cambridge Mark Scheme analysis.',
            homework: 'Revise all Topic 1 & 2 notes for CT 1.',
            diary: 'Revise Topics 1 & 2 thoroughly for CT 1.',
            bookPageUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Mark_Scheme.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Topic 3 & 10',
            topic: 'Past Paper Question Drill: Hardware & Logic Gates',
            inClassActivity: 'Solving 6-mark sensor scenario questions and multi-gate circuit truth tables.',
            homework: 'Complete Master Revision Guide questions.',
            diary: 'Complete Master Revision Guide problems.',
            bookPageUrl: 'downloads/olevel/O_Level_CS_Topic_1.1_and_1.2_Complete_Revision_Guide.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Topic_1.1_and_1.2_Past_Paper_Questions__2023-2026_.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Topic_1.1_and_1.2_Complete_Mark_Scheme___Answers.pdf'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Master Exam Paper',
            pages: 'CT 1 Paper (50 Marks)',
            topic: 'Timed Solving of Cambridge CT 1 Master Paper',
            inClassActivity: 'Simulating full 50-mark exam under timed Cambridge conditions. Exam hall discipline.',
            homework: 'Review self-marked areas.',
            diary: 'CT 1 mock solving completed.',
            bookPageUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.docx',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Mark_Scheme.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Examiner Report',
            pages: 'Mark Scheme Analysis',
            topic: 'Mark Scheme Walkthrough & Examiner Report Pitfalls',
            inClassActivity: 'Analyzing what examiner reports highlight as common student errors and vague answers.',
            homework: 'Final revision for CT 1 exam next week.',
            diary: 'CT 1 exam next week! Review all examiner tips.',
            bookPageUrl: 'downloads/olevel/O_Level_CS_Topic_1.1_and_1.2_Complete_Revision_Guide.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Mark_Scheme.pdf'
          }
        ]
      },
      {
        week: 5,
        title: 'Class Test 1 (CT 1) Exam & Software Systems (Topic 4)',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 1 Paper (50 Marks)',
            topic: 'Conducting Cambridge CT 1 Examination',
            inClassActivity: 'Students take the formal 50-mark CT 1 written examination.',
            homework: 'Read Coursebook Topic 4: Software.',
            diary: 'CT 1 exam completed today! Read Topic 4.',
            bookPageUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            hwFileUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Question_Paper.pdf',
            answerKeyUrl: 'downloads/olevel/O_Level_CS_Chapter_1_Exam_Mark_Scheme.pdf'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 102–106',
            topic: 'Topic 4: System Software vs Application Software',
            inClassActivity: 'Roles of OS: Interrupts and Buffers. How hardware interrupts handle higher priority events.',
            homework: 'Complete Worksheet on Operating System Roles.',
            diary: 'Read Coursebook Pg 102-106 on OS roles.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 107–110',
            topic: 'Translators: Compilers vs Interpreters vs Assemblers',
            inClassActivity: 'Comparing execution speed, error reporting, executable (.exe) generation, and RAM usage.',
            homework: 'Draw comparison table between Compiler and Interpreter in copy.',
            diary: 'Compare Compilers vs Interpreters in copy.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 111–114',
            topic: 'Integrated Development Environments (IDEs)',
            inClassActivity: 'Features of IDEs: Code editor, auto-completion, error diagnostics, debugger, and runtime environment.',
            homework: 'Complete Topic 4 Past Paper Questions Q1-Q8.',
            diary: 'Solve Topic 4 past paper questions in copy.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      },
      {
        week: 6,
        title: 'Topic 5: The Internet & Cyber Security',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 118–122',
            topic: 'Internet vs WWW, IP Addresses (IPv4 vs IPv6) & MAC Addresses',
            inClassActivity: 'Comparing static vs dynamic IP addresses. Format of MAC addresses (OUI and NIC identifier).',
            homework: 'Cambridge Topic 5 Past Paper: Solve Questions 1 to 6.',
            diary: 'Read Coursebook Pg 118-122 on IP and MAC.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 123–126',
            topic: 'Domain Name System (DNS) Resolution Process',
            inClassActivity: 'Step-by-step resolution: Browser cache -> Recursive resolver -> Root server -> TLD server -> Authoritative server.',
            homework: 'Draw the 6-step DNS resolution process chart in copy.',
            diary: 'Draw the DNS resolution process chart.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 127–132',
            topic: 'Cyber Threats: Phishing, Pharming, Ransomware, DoS / DDoS',
            inClassActivity: 'How Pharming poisons DNS/host files. Distributed Denial of Service (botnet) mechanisms and mitigation.',
            homework: 'Complete Cyber Threats Case Study Worksheet.',
            diary: 'Read Coursebook Pg 127-132 on Cyber Threats.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 133–138',
            topic: 'Security Measures: SSL/TLS Protocols, Firewalls & Digital Signatures',
            inClassActivity: 'The SSL Handshake protocol: Certificate validation, session key negotiation, and symmetric encryption.',
            homework: 'Complete SSL/TLS Worksheet Questions 1-6.',
            diary: 'Complete SSL/TLS worksheet exercises.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      },
      {
        week: 7,
        title: 'Class Test 2 (CT 2) Preparation & Algorithm Basics',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Topics 4 & 5',
            topic: 'Past Paper Questions on Topics 4 & 5 Drill',
            inClassActivity: 'Solving 10 years of Cambridge exam questions on Compilers, DNS, and Cyber Security under timed drill.',
            homework: 'Revise Topics 4 & 5 for Class Test 2 (CT 2).',
            diary: 'Study Topics 4 & 5 for Class Test 2 (CT 2).',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Master Exam Paper',
            pages: 'CT 2 Master Paper',
            topic: 'Timed Solving of CT 2 Master Exam Paper (50 Marks)',
            inClassActivity: 'Simulating full 50-mark Cambridge exam under timed conditions in class.',
            homework: 'Complete self-assessment corrections.',
            diary: 'Solve CT 2 master paper at home.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Examiner Report',
            pages: 'Mark Scheme Analysis',
            topic: 'Mark Scheme Walkthrough & Grade Boundaries Discussion',
            inClassActivity: 'Teaching students how to earn full 4-mark and 6-mark answers on cyber security scenarios.',
            homework: 'Revise all formula sheets.',
            diary: 'Review Cambridge examiner mark schemes.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Cambridge Coursebook 2nd Edition',
            pages: 'Pages 160–165',
            topic: 'Introduction to Topic 7: Pseudocode & Flowchart Symbols',
            inClassActivity: 'Standard flowchart symbols (Terminator, Process, Decision, Input/Output) and basic sequence logic.',
            homework: 'Final revision for CT 2 exam next week.',
            diary: 'CT 2 exam next week! Review all definitions and steps.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_07_-_Algorithm_Design_and_Problem_Solving__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_07_-_Algorithm_Design_and_Problem_Solving__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      },
      {
        week: 8,
        title: 'Class Test 2 (CT 2) Exam & Cambridge Master Strategy',
        days: [
          {
            dayNumber: 1,
            dayLabel: 'Class 1',
            book: 'Exam Paper Sheet',
            pages: 'CT 2 Paper (50 Marks)',
            topic: 'Conducting Cambridge CT 2 Examination',
            inClassActivity: 'Students sit for the formal 50-mark CT 2 written exam under exam supervision.',
            homework: 'Bring your past paper booklets for strategy review.',
            diary: 'CT 2 exam completed today.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_04_-_Software__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 2,
            dayLabel: 'Class 2',
            book: 'Examiner Report',
            pages: 'Paper Debrief',
            topic: 'CT 2 Paper Debrief & Individual Weak Area Diagnosis',
            inClassActivity: 'Returning marked papers, reviewing common mistakes, and highlighting model answers.',
            homework: 'Correct all mistakes in exam copy.',
            diary: 'Review teacher feedback on CT 2.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_05_-_The_Internet_and_Cyber_Security__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 3,
            dayLabel: 'Class 3',
            book: 'Cambridge Syllabus (2210/0478)',
            pages: 'Syllabus Review',
            topic: 'Target Setting & Cambridge Revision Roadmap',
            inClassActivity: 'Mapping out topics for Paper 1 (Computer Systems) vs Paper 2 (Algorithms, Programming & Logic).',
            homework: 'Set individual Cambridge grade targets.',
            diary: 'Roadmap planning completed.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_01_-_Data_Representation__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_01_-_Data_Representation__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          },
          {
            dayNumber: 4,
            dayLabel: 'Class 4',
            book: 'Past Papers Vault',
            pages: 'Term 2 Celebration',
            topic: 'Term 2 O Level CS Wrap-up & Recognition',
            inClassActivity: 'Recognition for consistent performance, problem solving champions, and term closing.',
            homework: 'Enjoy your well deserved term break!',
            diary: 'Term 2 successfully concluded.',
            bookPageUrl: 'downloads/olevel/Cambridge_IGCSE_and_O_Level_Computer_Science_Second_Edition.pdf',
            hwFileUrl: 'downloads/olevel/Topic_02_-_Data_Transmission__2023-2026_Exam_Questions___Mark_Scheme_.docx',
            answerKeyUrl: 'downloads/olevel/Topic_02_-_Data_Transmission__2023-2026_Exam_Questions___Mark_Scheme_.docx'
          }
        ]
      }
    ]
  }
];

console.log('🔄 Starting enhanced sync with Textbook pages, Homework, Answers & Classroom links...');

const processedClasses = [];
let totalCopied = 0;

for (const cfg of classConfigs) {
  const classDestDir = path.join(downloadsDir, cfg.id);
  if (!fs.existsSync(classDestDir)) {
    fs.mkdirSync(classDestDir, { recursive: true });
  }

  const allSourceFiles = [];
  for (const folderName of cfg.folders) {
    const fullFolderPath = path.join(rootDir, folderName);
    allSourceFiles.push(...getFilesRecursively(fullFolderPath));
  }

  const fileItems = [];
  for (const src of allSourceFiles) {
    const basename = path.basename(src);
    const ext = path.extname(src).toLowerCase();
    const stats = fs.statSync(src);
    const size = stats.size;
    const relPath = path.relative(rootDir, src);

    const safeName = sanitizeFilename(basename);
    const destPath = path.join(classDestDir, safeName);

    let needCopy = true;
    if (fs.existsSync(destPath)) {
      const destStats = fs.statSync(destPath);
      if (destStats.size === size) {
        needCopy = false;
      }
    }

    if (needCopy) {
      try {
        fs.copyFileSync(src, destPath);
        totalCopied++;
      } catch (err) {
        console.warn(`Could not copy ${basename}: ${err.message}`);
      }
    }

    const { category, badge, term, isAnswerKey, examType } = classifyFile(basename, relPath);

    fileItems.push({
      id: `${cfg.id}_${safeName}`,
      name: basename,
      safeName: safeName,
      ext: ext,
      sizeBytes: size,
      sizeFormatted: formatBytes(size),
      category: category,
      badge: badge,
      term: term,
      isAnswerKey: isAnswerKey,
      examType: examType,
      url: `downloads/${cfg.id}/${safeName}`,
      sourceRelPath: relPath.replace(/\\/g, '/')
    });
  }

  processedClasses.push({
    id: cfg.id,
    name: cfg.name,
    code: cfg.code,
    grade: cfg.grade,
    icon: cfg.icon,
    subjects: cfg.subjects,
    folders: cfg.folders,
    classesPerWeek: cfg.classesPerWeek,
    defaultBook: cfg.defaultBook,
    defaultBookFile: cfg.defaultBookFile,
    defaultHwFile: cfg.defaultHwFile,
    defaultAnswerFile: cfg.defaultAnswerFile,
    term1Weeks: cfg.term1Weeks || cfg.weeks,
    term2Weeks: cfg.term2Weeks || cfg.weeks,
    weeks: cfg.term2Weeks || cfg.weeks,
    totalFiles: fileItems.length,
    files: fileItems
  });
}

const finalData = {
  schoolName: 'Singapore School Kinderland',
  title: 'Teacher & Academic Resource Portal',
  currentTerm: 'Term 2',
  academicYear: '2026-2027',
  lastUpdated: new Date().toISOString(),
  classes: processedClasses
};

// Write data.json
const dataJsonPath = path.join(portalDir, 'data.json');
fs.writeFileSync(dataJsonPath, JSON.stringify(finalData, null, 2), 'utf-8');

// Write data.js
const dataJsPath = path.join(portalDir, 'data.js');
fs.writeFileSync(dataJsPath, `window.SCHOOL_DATA = ${JSON.stringify(finalData, null, 2)};`, 'utf-8');

console.log(`✅ Enhanced Sync completed successfully!`);
console.log(`📊 Output saved to portal/data.json & portal/data.js`);
