// Singapore School Kinderland - Academic Portal Engine (Enhanced English Version)

let currentClassId = 'p1';
let currentTerm = 'Term 2';
let currentTab = 'weekly';
let fileFilterType = 'all';
let searchQuery = '';

// LocalStorage key for persistent class tracking
const STORAGE_KEY = 'kinderland_class_tracking_v1';

function getStoredTracking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredTracking(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tracking', e);
  }
}

function getClassStatusKey(classId, week, day) {
  return `${classId}_w${week}_d${day}`;
}

function getClassTracking(classId, week, day) {
  const all = getStoredTracking();
  const key = getClassStatusKey(classId, week, day);
  return all[key] || { status: 'pending', note: '', timestamp: null };
}

function setClassTracking(classId, week, day, status, note = '') {
  const all = getStoredTracking();
  const key = getClassStatusKey(classId, week, day);
  all[key] = {
    status: status, // 'completed' | 'postponed' | 'pending'
    note: note,
    timestamp: new Date().toISOString()
  };
  saveStoredTracking(all);
}

function toggleClassComplete(classId, week, day) {
  const current = getClassTracking(classId, week, day);
  if (current.status === 'completed') {
    setClassTracking(classId, week, day, 'pending', '');
    showToast(`Session marked as Upcoming`);
  } else {
    setClassTracking(classId, week, day, 'completed', '');
    showToast(`🎉 Session successfully marked as Completed!`);
  }
  renderCurrentClass();
}

function toggleClassPostpone(classId, week, day) {
  const current = getClassTracking(classId, week, day);
  if (current.status === 'postponed') {
    setClassTracking(classId, week, day, 'pending', '');
    showToast(`Postponed status cleared (Session is Upcoming)`);
  } else {
    const reason = prompt(
      'Enter reason for postponing this session (e.g. School Holiday, Sports Day, Medical Leave):\n\n(Note: This class will NEVER be skipped, it will shift to the next session)',
      'School Holiday / Special Event'
    );
    if (reason !== null) {
      setClassTracking(classId, week, day, 'postponed', reason.trim() || 'Postponed / To be covered next session');
      showToast(`⚠️ Session marked as Postponed (will shift to next class)`);
    }
  }
  renderCurrentClass();
}

function resetClassStatus(classId, week, day) {
  setClassTracking(classId, week, day, 'pending', '');
  showToast(`Session status reset to Upcoming`);
  renderCurrentClass();
}

// DOM Elements
const classListEl = document.getElementById('classList');
const classNameEl = document.getElementById('className');
const classGradeBadgeEl = document.getElementById('classGradeBadge');
const classSubjectsEl = document.getElementById('classSubjects');
const classFreqBadgeEl = document.getElementById('classFreqBadge');
const classIconEl = document.getElementById('classIcon');
const bannerFileCountEl = document.getElementById('bannerFileCount');
const bannerWeekCountEl = document.getElementById('bannerWeekCount');
const bannerExamCountEl = document.getElementById('bannerExamCount');
const headerFileCountEl = document.getElementById('headerFileCount');

const weeklyPlanContainer = document.getElementById('weeklyPlanContainer');
const examsGrid = document.getElementById('examsGrid');
const worksheetsGrid = document.getElementById('worksheetsGrid');
const allFilesTableBody = document.getElementById('allFilesTableBody');
const allFilesCountBadge = document.getElementById('allFilesCountBadge');

const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchResultCount = document.getElementById('searchResultCount');
const classDetailSection = document.getElementById('classDetailSection');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.SCHOOL_DATA === 'undefined') {
    console.error('School data not found.');
    return;
  }
  updateGlobalStats();
  renderClassTabs();
  renderCurrentClass();
});

function updateGlobalStats() {
  const totalFiles = window.SCHOOL_DATA.classes.reduce((sum, c) => sum + (c.files ? c.files.length : 0), 0);
  if (headerFileCountEl) {
    headerFileCountEl.innerHTML = `<span>📁 ${totalFiles} Files Ready</span>`;
  }
}

// Render Horizontal Class Tabs
function renderClassTabs() {
  if (!classListEl) return;
  classListEl.innerHTML = '';

  window.SCHOOL_DATA.classes.forEach(cls => {
    const isActive = cls.id === currentClassId;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.onclick = () => selectClass(cls.id);
    btn.className = `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 border ${
      isActive 
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.02]' 
        : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
    }`;

    btn.innerHTML = `
      <span class="text-base">${cls.icon}</span>
      <span>${cls.name}</span>
      <span class="ml-1 text-[11px] px-1.5 py-0.5 rounded-md ${
        isActive ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-100 text-slate-500'
      }">${cls.files ? cls.files.length : 0}</span>
    `;

    classListEl.appendChild(btn);
  });
}

function selectClass(id) {
  currentClassId = id;
  renderClassTabs();
  renderCurrentClass();
  if (searchQuery) clearSearch();
}

function switchTerm(term) {
  currentTerm = term;
  const term2Btn = document.getElementById('term2Btn');
  const term1Btn = document.getElementById('term1Btn');

  if (term === 'Term 2') {
    term2Btn.className = "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm bg-indigo-600 text-white";
    term1Btn.className = "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-600 hover:text-slate-900";
  } else {
    term1Btn.className = "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm bg-slate-800 text-white";
    term2Btn.className = "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-600 hover:text-slate-900";
  }

  renderCurrentClass();
  showToast(`Switched to ${term}`);
}

function switchTab(tab) {
  currentTab = tab;
  const tabs = ['weekly', 'exams', 'worksheets', 'allFiles'];
  
  tabs.forEach(t => {
    const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    const view = document.getElementById(`view${t.charAt(0).toUpperCase() + t.slice(1)}`);
    
    if (t === tab) {
      if (btn) {
        btn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all whitespace-nowrap bg-indigo-600 text-white border-indigo-600 shadow-sm";
      }
      if (view) view.classList.remove('hidden');
    } else {
      if (btn) {
        btn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap bg-white text-slate-700 border-slate-200 hover:bg-slate-50";
      }
      if (view) view.classList.add('hidden');
    }
  });
}

function getCurrentClassData() {
  return window.SCHOOL_DATA.classes.find(c => c.id === currentClassId);
}

// Render the active Class view
function renderCurrentClass() {
  const cls = getCurrentClassData();
  if (!cls) return;

  classNameEl.textContent = cls.name;
  classGradeBadgeEl.textContent = cls.grade || cls.name;
  classSubjectsEl.innerHTML = `<span>📚 Subjects: ${cls.subjects.join(', ')}</span> • <span class="text-amber-300 font-semibold">${cls.classesPerWeek || 2} Classes / Week</span>`;
  classIconEl.textContent = cls.icon;

  const files = cls.files || [];
  // Filter strictly by active term
  const termFiles = files.filter(f => currentTerm === 'Term 2' ? (f.term === 'Term 2') : (f.term === 'Term 1' || f.term === 'General'));
  const examFiles = termFiles.filter(f => f.category === 'exam');
  const worksheetFiles = termFiles.filter(f => f.category === 'worksheet');

  const activeWeeks = (currentTerm === 'Term 2' ? (cls.term2Weeks || cls.weeks) : (cls.term1Weeks || cls.weeks)) || [];

  bannerFileCountEl.textContent = termFiles.length;
  bannerWeekCountEl.textContent = activeWeeks.length;
  bannerExamCountEl.textContent = `${examFiles.length} Available`;

  renderSyllabusBar(cls);
  renderWeeklyPlan(cls);
  renderExams(examFiles, cls);
  renderWorksheets(worksheetFiles, cls);
  renderAllFiles(termFiles);
}

// RENDER DEDICATED TERM PLAN & SYLLABUS BAR
function renderSyllabusBar(cls) {
  const el = document.getElementById('classSyllabusBar');
  if (!el) return;

  const files = cls.files || [];
  const allPlanFiles = files.filter(f => f.category === 'term_plan');

  // Find Term Plan PDF & DOCX for active term
  let planPdf = allPlanFiles.find(f => f.ext === '.pdf' && (currentTerm === 'Term 2' ? f.term === 'Term 2' : f.term === 'Term 1'));
  if (!planPdf) planPdf = allPlanFiles.find(f => f.ext === '.pdf');

  let planDocx = allPlanFiles.find(f => f.ext === '.docx' && (currentTerm === 'Term 2' ? f.term === 'Term 2' : f.term === 'Term 1'));
  if (!planDocx) planDocx = allPlanFiles.find(f => f.ext === '.docx');

  const masterPdfUrl = 'downloads/IT_Term_2_Syllabus_Master.pdf';
  const masterDocxUrl = 'downloads/IT_Term_2_Syllabus_Master.docx';

  const activePdfUrl = planPdf ? planPdf.url : masterPdfUrl;
  const activePdfName = planPdf ? planPdf.name : 'IT_Term_2_Syllabus_Master.pdf';
  const activeDocxUrl = planDocx ? planDocx.url : masterDocxUrl;
  const activeDocxName = planDocx ? planDocx.name : 'IT_Term_2_Syllabus_Master.docx';

  let syllabusScopeText = 'Weeks 1–4: CT 1 • Weeks 5–8: CT 2';
  let syllabusHighlights = '<strong>CT 1 Syllabus:</strong> First Half Units • <strong>CT 2 Syllabus:</strong> Second Half Units (Excluding CT 1 topics).';

  if (cls.id === 'p1') {
    syllabusScopeText = 'CT 1 (Pg 26–33) • CT 2 (Pg 34–44)';
    syllabusHighlights = '<strong>CT 1 Syllabus:</strong> Chapter 4: Parts of a Computer (From Page 26 to Page 33).<br><strong class="text-emerald-700">CT 2 Syllabus:</strong> Chapter 5: Introduction to Logic (From Page 34 to Page 44).';
  } else if (cls.id === 'p2') {
    syllabusScopeText = 'CT 1 (Pg 18–30) • CT 2 (Pg 31–48)';
    syllabusHighlights = '<strong>CT 1 Syllabus:</strong> Chapter 2B: Keyboard & Notepad (From Page 18 to Page 26) & Chapter 3: Windows 10 O/S (From Page 27 to Page 30).<br><strong class="text-emerald-700">CT 2 Syllabus:</strong> Chapter 3: Desktop Customization (From Page 31 to Page 38) & Chapter 4: Algorithm (From Page 39 to Page 48).';
  } else if (cls.id === 'p3') {
    syllabusScopeText = 'CT 1 (Pg 18–38) • CT 2 (Pg 39–50)';
    syllabusHighlights = '<strong>CT 1 Syllabus:</strong> Chapter 3: Internet & Networks (From Page 18 to Page 28) & Chapter 4: E-Commerce (From Page 29 to Page 38).<br><strong class="text-emerald-700">CT 2 Syllabus:</strong> Chapter 5A: MS Word Formatting & Cyber Ethics (From Page 39 to Page 50).';
  }

  el.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-2xl shadow-md shrink-0 border border-white/20">
          📋
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">
              ${cls.name} — Official ${currentTerm} Syllabus & Term Plan
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              ${syllabusScopeText}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ In-Browser Preview Ready
            </span>
          </div>
          <div class="text-xs text-slate-600 mt-1 leading-relaxed">
            ${syllabusHighlights}
          </div>
        </div>
      </div>

      <!-- Action Button Group -->
      <div class="flex items-center gap-2 flex-wrap shrink-0">
        <!-- 1-Click Preview Button -->
        <button onclick="openPreview('${safeAttr(activePdfUrl)}', '${safeAttr(activePdfName)}', 'Term Plan & Syllabus', '${safeAttr(cls.name + ' • ' + currentTerm)}')" class="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95" title="View Syllabus directly in browser without downloading">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>👁️ Preview Syllabus</span>
        </button>

        <!-- Download PDF -->
        <a href="${activePdfUrl}" download="${activePdfName}" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-xs active:scale-95" title="Download Syllabus PDF">
          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>📥 Download PDF</span>
        </a>

        <!-- Download DOCX -->
        <a href="${activeDocxUrl}" download="${activeDocxName}" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-xs active:scale-95" title="Download Syllabus Word (.docx)">
          <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>📥 Download DOCX</span>
        </a>

        <!-- Master Syllabus Link -->
        <button onclick="openPreview('${masterPdfUrl}', 'IT_Term_2_Syllabus_Master.pdf', 'Master Syllabus', 'All Classes • Master Term 2 Syllabus')" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs active:scale-95" title="View Full Master Syllabus for all grades">
          <span>🌐 Master Syllabus</span>
        </button>
      </div>
    </div>
  `;
}

// VIEW 1: ENHANCED WEEKLY PLAN & TEACHER'S TOOLKIT
function renderWeeklyPlan(cls) {
  if (!weeklyPlanContainer) return;
  weeklyPlanContainer.innerHTML = '';

  const weeks = (currentTerm === 'Term 2' ? (cls.term2Weeks || cls.weeks) : (cls.term1Weeks || cls.weeks)) || [];

  if (weeks.length === 0) {
    weeklyPlanContainer.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
        <span class="text-4xl">📝</span>
        <p class="text-sm font-semibold text-slate-600 mt-2">No weekly lesson plan available for this class.</p>
      </div>
    `;
    return;
  }

  // Calculate Progress Stats
  let totalSessions = 0;
  let completedCount = 0;
  let postponedCount = 0;

  weeks.forEach(w => {
    (w.days || []).forEach(d => {
      totalSessions++;
      const trk = getClassTracking(cls.id, w.week, d.dayNumber);
      if (trk.status === 'completed') completedCount++;
      if (trk.status === 'postponed') postponedCount++;
    });
  });

  const pendingCount = totalSessions - completedCount - postponedCount;
  const pct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Insert Syllabus Architecture & Split Card
  const syllabusCard = document.createElement('div');
  syllabusCard.className = "bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/90 rounded-3xl border border-indigo-200/90 p-5 sm:p-6 shadow-sm";
  
  let p1ct1 = 'Weeks 1–4 foundational topics';
  let p1ct2 = 'Weeks 5–8 advanced topics (excluding CT 1 topics)';
  if (cls.id === 'p1') {
    p1ct1 = 'Chapter 4: Parts of a Computer (From Page 26 to Page 33)';
    p1ct2 = 'Chapter 5: Introduction to Logic (From Page 34 to Page 44)';
  } else if (cls.id === 'p2') {
    p1ct1 = 'Chapter 2B: Keyboard & Notepad (From Page 18 to Page 26) & Chapter 3: Windows 10 O/S (From Page 27 to Page 30)';
    p1ct2 = 'Chapter 3: Desktop Customization (From Page 31 to Page 38) & Chapter 4: Algorithm (From Page 39 to Page 48)';
  } else if (cls.id === 'p3') {
    p1ct1 = 'Chapter 3: Internet & Networks (From Page 18 to Page 28) & Chapter 4: E-Commerce (From Page 29 to Page 38)';
    p1ct2 = 'Chapter 5A: MS Word Formatting & Cyber Ethics (From Page 39 to Page 50)';
  }

  syllabusCard.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-200/60">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🧭</span>
        <div>
          <h4 class="text-base font-extrabold text-slate-900">Term 2 Syllabus & Exam Split Mapping</h4>
          <p class="text-xs text-slate-600 mt-0.5">
            Class Test 1 covers the 1st part; Class Test 2 covers the remaining syllabus without repeating CT 1 questions.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-start md:self-auto">
        <button onclick="switchTab('exams')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95">
          🎯 View Exam Papers
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
      <div class="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs">
        <div class="flex items-center justify-between mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            🎯 Class Test 1 (Part 1 Syllabus)
          </span>
          <span class="font-bold text-slate-500">Weeks 1 to 4</span>
        </div>
        <p class="font-bold text-slate-900 text-sm mt-1">${p1ct1}</p>
        <p class="text-slate-500 mt-1">Evaluates initial foundational lessons and hardware/practical concepts.</p>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
        <div class="flex items-center justify-between mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            🎯 Class Test 2 / Main Exam (Part 2 Syllabus)
          </span>
          <span class="font-bold text-emerald-700">Weeks 5 to 8</span>
        </div>
        <p class="font-bold text-slate-900 text-sm mt-1">${p1ct2}</p>
        <p class="text-emerald-700 font-medium mt-1">100% focused on remaining topics taught after CT 1. Zero question repetition!</p>
      </div>
    </div>
  `;

  weeklyPlanContainer.appendChild(syllabusCard);

  // Insert Overall Progress Tracker Banner
  const progressBanner = document.createElement('div');
  progressBanner.className = "bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm";
  progressBanner.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xl">📊</span>
          <h4 class="text-base sm:text-lg font-bold text-slate-900">Academic Lesson & Progress Tracker</h4>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            ${pct}% Completed
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Mark classes as <strong class="text-emerald-700">"Completed"</strong> once taught. If postponed, mark <strong class="text-amber-700">"Postponed"</strong>—<span class="text-indigo-600 font-semibold underline">topics are never skipped</span> and will automatically carry over to the next session.
        </p>
      </div>

      <!-- Quick Counters -->
      <div class="flex items-center gap-2 flex-wrap text-xs font-bold">
        <span class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>${completedCount} Completed</span>
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>${postponedCount} Postponed (Shifted)</span>
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>${pendingCount} Upcoming</span>
        </span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
      <div class="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
    </div>
  `;

  weeklyPlanContainer.appendChild(progressBanner);

  // Render Weeks
  weeks.forEach((w) => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-indigo-600";

    const isExamWeek = w.title.toLowerCase().includes('class test') || w.title.toLowerCase().includes('ct 1') || w.title.toLowerCase().includes('ct 2') || w.title.toLowerCase().includes('exam');

    let daysHtml = '';
    const days = w.days || [];

    days.forEach((d) => {
      const bookName = d.book || cls.defaultBook || 'Main Textbook';
      const pages = d.pages || 'Assigned Pages';
      const topic = d.topic || 'Class Topic';
      const inClass = d.inClassActivity || 'Detailed lesson practice, explanation and computer lab tasks.';
      const hw = d.homework || 'Read assigned textbook pages and review exercises.';
      
      const bookUrl = d.bookPageUrl || cls.defaultBookFile || (cls.files[0] ? cls.files[0].url : '#');
      const hwUrl = d.hwFileUrl || cls.defaultHwFile || (cls.files[1] ? cls.files[1].url : '#');
      const ansUrl = d.answerKeyUrl || cls.defaultAnswerFile || (cls.files[2] ? cls.files[2].url : '#');

      // Tracking info for this session
      const trk = getClassTracking(cls.id, w.week, d.dayNumber);
      const isCompleted = trk.status === 'completed';
      const isPostponed = trk.status === 'postponed';

      // Status Badge & Border styling
      let statusBorderClass = 'border-slate-200 bg-slate-50/70';
      let statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>⏳ Upcoming</span>
        </span>
      `;

      if (isCompleted) {
        statusBorderClass = 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-400/30';
        statusBadgeHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>✅ Completed</span>
          </span>
        `;
      } else if (isPostponed) {
        statusBorderClass = 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/30';
        statusBadgeHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>⚠️ Postponed / Rescheduled</span>
          </span>
        `;
      }

      // 1. Google Classroom Text (100% English, Parent-Complaint-Proof with Absentee Action Plan)
      const gcFormattedText = 
`📢 [CLASS UPDATE & HOME STUDY GUIDE]
🏫 Singapore School Kinderland • ${cls.name}
📚 Subject: Computer Science / ICT
📅 Term 2 • Week ${w.week} (${d.dayLabel || 'Class ' + d.dayNumber})

==================================================
🎯 TODAY'S LESSON OVERVIEW
• Topic: ${topic}
• Textbook: ${bookName} (Pages: ${pages})

📝 WHAT WE DID IN CLASS:
${inClass}

🏠 HOMEWORK ASSIGNED:
• ${hw}
• Submission Due: Next Class Session

==================================================
📌 FOR ABSENT STUDENTS (HOME-STUDY ACTION GUIDE):
Dear Parents & Students,
If your child missed today's class, please follow these 3 simple steps at home to stay fully on track:
1️⃣ Read & Review: Review textbook pages ${pages} using the attached book page extract.
2️⃣ Concept Understanding: Go through the lesson summary points above.
3️⃣ Complete Task: Solve the assigned homework in your exercise book or complete the practice worksheet. Bring it to the next class.

==================================================
📎 ATTACHED RESOURCES & DOWNLOADS:
• 📖 Textbook Reading Extract: Pages ${pages} (PDF/Image)
• 📝 Student Practice / Homework Worksheet (PDF)
• 🔑 Teacher Solution & Answer Key (PDF)

*All resources and lesson schedules are synchronized on the Kinderland Academic Portal.`;

      // 2. Student Diary Text (100% English)
      const diaryText = `[ICT] Read TB ${pages}. HW: ${hw}. (Absent students: check Google Classroom for book pages & study guide).`;

      // 3. Parent / WhatsApp Alert Text (100% English)
      const whatsappAlertText = 
`Dear Parents, today in ${cls.name} ICT, we covered "${topic}" from textbook pages ${pages}. Homework: ${hw}. If your child was absent today, please review Google Classroom for the textbook pages and step-by-step home study guide. Thank you! - Singapore School Kinderland`;

      const diaryEscaped = encodeURIComponent(diaryText);
      const gcEscaped = encodeURIComponent(gcFormattedText);
      const waEscaped = encodeURIComponent(whatsappAlertText);

      // Check if real Term 2 files exist for this class
      const hasTerm2Files = (cls.files || []).some(f => f.term === 'Term 2');
      const hasTerm2Hw = hasTerm2Files && (cls.files || []).some(f => f.term === 'Term 2' && f.category === 'worksheet');
      const hasTerm2Ans = hasTerm2Files && (cls.files || []).some(f => f.term === 'Term 2' && f.isAnswerKey);

      let bookButtonHtml = `
        <span class="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold text-center">
          📖 ${pages}
        </span>
      `;
      if (d.bookPageUrl && (d.bookPageUrl.toLowerCase().includes('term 2') || d.bookPageUrl.toLowerCase().includes('term2') || hasTerm2Files || d.bookPageUrl.toLowerCase().includes('cambridge'))) {
        bookButtonHtml = `
          <div class="flex items-center gap-1 w-full">
            <button onclick="openPreview('${safeAttr(bookUrl)}', '${safeAttr(bookName + ' (' + pages + ')')}', 'Textbook Page', '${safeAttr(cls.name + ' • ' + pages)}')" class="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 text-center truncate" title="View Book Page directly in browser without downloading">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span class="truncate">👁️ View Book</span>
            </button>
            <a href="${bookUrl}" download class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all shrink-0" title="Download Book Page">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>
          </div>
        `;
      }

      let hwButtonHtml = `
        <span class="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold text-center cursor-not-allowed" title="Available once Term 2 homework sheets are generated">
          ⏳ HW In Progress
        </span>
      `;
      if (hasTerm2Hw) {
        hwButtonHtml = `
          <div class="flex items-center gap-1 w-full">
            <button onclick="openPreview('${safeAttr(hwUrl)}', '${safeAttr(hw)}', 'Homework / Workbook', '${safeAttr(cls.name + ' • Term 2')}')" class="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 text-center truncate" title="View Homework Sheet in browser without downloading">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span class="truncate">👁️ View HW</span>
            </button>
            <a href="${hwUrl}" download class="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all shrink-0" title="Download Homework Sheet">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>
          </div>
        `;
      }

      let ansButtonHtml = `
        <span class="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold text-center cursor-not-allowed" title="Available once Term 2 answer keys are generated">
          ⏳ Solution In Progress
        </span>
      `;
      if (hasTerm2Ans) {
        ansButtonHtml = `
          <div class="flex items-center gap-1 w-full">
            <button onclick="openPreview('${safeAttr(ansUrl)}', '${safeAttr(topic + ' - Answer Key')}', 'Answer Key', '${safeAttr(cls.name + ' • Term 2 Solution')}')" class="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 text-center truncate" title="View Answer Key in browser without downloading">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span class="truncate">👁️ View Key</span>
            </button>
            <a href="${ansUrl}" download class="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all shrink-0" title="Download Answer Key">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>
          </div>
        `;
      }

      daysHtml += `
        <div class="rounded-2xl border ${statusBorderClass} p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all">
          
          <div>
            <!-- Class Badge, Pages Pill & Status -->
            <div class="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-200/80">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-sm">
                  <span>🗓️</span>
                  <span>${d.dayLabel || 'Class ' + d.dayNumber}</span>
                </span>
                ${statusBadgeHtml}
              </div>

              <!-- Textbook & Pages Pill -->
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                <span>📖</span>
                <span>${bookName} • <span class="text-indigo-700 underline">${pages}</span></span>
              </span>
            </div>

            <!-- POSTPONED ALERT (SKIP PROTECTION GUARANTEE) -->
            ${isPostponed ? `
              <div class="mt-3 p-3 rounded-xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                <span class="text-base shrink-0">🛡️</span>
                <div>
                  <div class="font-extrabold text-amber-900">
                    Session Postponed (Reason: ${trk.note || 'School Holiday / Event'})
                  </div>
                  <div class="text-[11px] text-amber-800 font-medium mt-0.5">
                    👉 <strong>Rest Assured:</strong> This class topic is NOT skipped! It will be seamlessly covered in the next available session.
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Topic Title -->
            <div class="mt-3">
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                ${topic}
              </h5>
            </div>

            <!-- In-Class Activity -->
            <div class="mt-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              <span class="font-bold text-indigo-700 block mb-1">🎯 In-Class Learning & Activity:</span>
              ${inClass}
            </div>

            <!-- Homework Section -->
            <div class="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 leading-relaxed font-medium">
              <div class="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <span>🏠</span>
                <span>Homework (To complete at home):</span>
              </div>
              <p class="text-amber-900/90 font-medium">${hw}</p>
            </div>
          </div>

          <!-- 3 DOWNLOAD BUTTONS (Book Page | HW Sheet | Answer Key) -->
          <div class="pt-3 border-t border-slate-200 space-y-2.5">
            <div class="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
              <span>📥 Resource Downloads:</span>
              <span class="text-xs font-semibold ${hasTerm2Files ? 'text-emerald-600' : 'text-amber-600'}">
                ${hasTerm2Files ? '✓ Term 2 Files Synced' : '⏳ Term 2 Files In Progress'}
              </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              ${bookButtonHtml}
              ${hwButtonHtml}
              ${ansButtonHtml}
            </div>
          </div>

          <!-- TEACHER ACTION BAR (STATUS CONTROLS + COPY TOOLS) -->
          <div class="pt-3 border-t border-slate-200 space-y-2">
            
            <!-- STATUS BUTTONS: COMPLETE & POSTPONE -->
            <div class="flex items-center gap-2 flex-wrap">
              
              <!-- Toggle Complete Button -->
              <button onclick="toggleClassComplete('${cls.id}', ${w.week}, ${d.dayNumber})" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl ${
                isCompleted 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
              } text-xs font-bold transition-all active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>${isCompleted ? '✓ Completed (Click to undo)' : '✅ Mark Completed'}</span>
              </button>

              <!-- Postpone Button (Skip Protection) -->
              <button onclick="toggleClassPostpone('${cls.id}', ${w.week}, ${d.dayNumber})" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl ${
                isPostponed
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
              } text-xs font-bold transition-all active:scale-95" title="Postpone session if school is closed or rescheduled (No-Skip Protection)">
                <span>${isPostponed ? '⏸️ Undo Postpone' : '⏸️ Postpone (No-Skip)'}</span>
              </button>

              ${(isCompleted || isPostponed) ? `
                <button onclick="resetClassStatus('${cls.id}', ${w.week}, ${d.dayNumber})" class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold" title="Reset session status">
                  🔄
                </button>
              ` : ''}

            </div>

            <!-- 3 1-CLICK COPY BUTTONS: DIARY, CLASSROOM & WHATSAPP ALERT -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              
              <!-- Copy Diary Button -->
              <button onclick="copyToClipboard('${diaryEscaped}', 'Student Diary Note')" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm transition-all active:scale-95">
                <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                <span>📋 Copy Diary</span>
              </button>

              <!-- Copy Classroom Button -->
              <button onclick="copyToClipboard('${gcEscaped}', 'Google Classroom Post')" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-300 text-xs font-bold shadow-sm transition-all active:scale-95">
                <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                <span>📋 Copy Classroom</span>
              </button>

              <!-- Copy WhatsApp / Parent Alert Button -->
              <button onclick="copyToClipboard('${waEscaped}', 'Parent WhatsApp Alert')" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-sm transition-all active:scale-95" title="Copy parent notification for WhatsApp group or SMS">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <span>💬 Copy Parent Alert</span>
              </button>

            </div>

          </div>

        </div>
      `;
    });

    card.innerHTML = `
      <div class="p-5 sm:p-7">
        <!-- Week Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-base shrink-0 border border-indigo-200 shadow-inner">
              W${w.week}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Week ${w.week}</span>
                ${isExamWeek ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">🎯 Assessment / Exam Week</span>' : ''}
              </div>
              <h4 class="text-base sm:text-xl font-extrabold text-slate-900">${w.title}</h4>
            </div>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-center">
            <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              ⏱️ ${days.length} Class Sessions
            </span>
          </div>
        </div>

        <!-- Class Breakdown Grid -->
        <div class="mt-5 grid grid-cols-1 lg:grid-cols-${days.length > 2 ? '3' : '2'} gap-4">
          ${daysHtml}
        </div>
      </div>
    `;

    weeklyPlanContainer.appendChild(card);
  });
}

// VIEW 2: EXAMS & ASSESSMENTS VAULT (SPLIT-SYLLABUS ARCHITECTURE)
function renderExams(examFiles, cls) {
  if (!examsGrid) return;
  examsGrid.innerHTML = '';

  if (examFiles.length === 0) {
    if (currentTerm === 'Term 2') {
      examsGrid.innerHTML = `
        <div class="col-span-full text-center py-14 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 shadow-xs">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-200">
            ⏳
          </div>
          <h4 class="text-base sm:text-lg font-bold text-slate-900">Term 2 Exam Papers In Progress for ${cls.name}</h4>
          <p class="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            As soon as AI agents generate Term 2 CT 1, CT 2, and Exam question papers, running <strong>sync-portal.bat</strong> will automatically update them here.
          </p>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button onclick="switchTerm('Term 1')" class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all shadow-sm">
              📦 View Term 1 Archive Exam Papers
            </button>
          </div>
        </div>
      `;
    } else {
      examsGrid.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <span class="text-4xl">📄</span>
          <p class="text-sm font-semibold text-slate-600 mt-2">No exam papers uploaded yet for this class.</p>
        </div>
      `;
    }
    return;
  }

  // Split files into CT 1, CT 2, and Others
  const ct1Files = examFiles.filter(f => {
    const l = f.name.toLowerCase();
    return l.includes('class_test_1') || l.includes('class test 1') || l.includes('class test-1') || l.includes('ct 1') || l.includes('ct1');
  });

  const ct2Files = examFiles.filter(f => {
    const l = f.name.toLowerCase();
    return l.includes('class_test_2') || l.includes('class test 2') || l.includes('class test-2') || l.includes('ct 2') || l.includes('ct2');
  });

  const otherFiles = examFiles.filter(f => !ct1Files.includes(f) && !ct2Files.includes(f));

  function createExamCard(f) {
    const isDocx = f.ext === '.docx';
    const isPdf = f.ext === '.pdf';
    const badgeColor = f.isAnswerKey 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
      : 'bg-rose-100 text-rose-800 border-rose-300';

    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="w-10 h-10 rounded-xl ${isDocx ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} flex items-center justify-center font-bold text-xs shrink-0 border ${isDocx ? 'border-blue-200' : 'border-red-200'}">
            ${isDocx ? 'DOCX' : isPdf ? 'PDF' : 'FILE'}
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeColor}">
            ${f.badge}
          </span>
        </div>

        <h4 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2" title="${f.name}">
          ${f.name}
        </h4>
        <div class="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
          <span>${f.term}</span>
          <span>•</span>
          <span>${f.sizeFormatted}</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button onclick="openPreview('${safeAttr(f.url)}', '${safeAttr(f.name)}', '${safeAttr(f.badge)}', '${safeAttr(f.term + ' • ' + f.sizeFormatted)}')" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold border border-indigo-200 transition-all active:scale-95" title="View exam paper in browser without downloading">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>👁️ Preview</span>
        </button>
        <a href="${f.url}" download="${f.name}" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95" title="Download to device">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>Download</span>
        </a>
      </div>
    `;
    return card;
  }

  // Get syllabus descriptions for CT 1 & CT 2
  let ct1Desc = 'CT 1 Syllabus: Weeks 1 to 4 foundational lessons.';
  let ct2Desc = 'CT 2 Syllabus: Weeks 5 to 8 advanced lessons (strictly excludes CT 1 topics).';

  if (cls.id === 'p1') {
    ct1Desc = 'CT 1 Syllabus: Chapter 4: Parts of a Computer (From Page 26 to Page 33).';
    ct2Desc = 'CT 2 Syllabus: Chapter 5: Introduction to Logic (From Page 34 to Page 44).';
  } else if (cls.id === 'p2') {
    ct1Desc = 'CT 1 Syllabus: Chapter 2B: Keyboard & Notepad (From Page 18 to Page 26) & Chapter 3: Windows 10 O/S (From Page 27 to Page 30).';
    ct2Desc = 'CT 2 Syllabus: Chapter 3: Desktop Customization (From Page 31 to Page 38) & Chapter 4: Algorithm (From Page 39 to Page 48).';
  } else if (cls.id === 'p3') {
    ct1Desc = 'CT 1 Syllabus: Chapter 3: Internet & Networks (From Page 18 to Page 28) & Chapter 4: E-Commerce (From Page 29 to Page 38).';
    ct2Desc = 'CT 2 Syllabus: Chapter 5A: MS Word Formatting & Cyber Ethics (From Page 39 to Page 50).';
  }

  // 1. Render CT 1 Section
  if (ct1Files.length > 0) {
    const section1 = document.createElement('div');
    section1.className = "bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4";
    section1.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
              🎯 Class Test 1 (First Half Syllabus)
            </span>
            <span class="text-xs text-slate-500 font-semibold">Weeks 1 to 4</span>
          </div>
          <p class="text-xs text-slate-600 mt-1 font-medium leading-relaxed">${ct1Desc}</p>
        </div>
        <span class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 self-start sm:self-center">
          ${ct1Files.length} Test Files Available
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" id="ct1FilesGrid"></div>
    `;
    examsGrid.appendChild(section1);
    const grid1 = section1.querySelector('#ct1FilesGrid');
    ct1Files.forEach(f => grid1.appendChild(createExamCard(f)));
  }

  // 2. Render CT 2 Section
  if (ct2Files.length > 0) {
    const section2 = document.createElement('div');
    section2.className = "bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4";
    section2.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              🎯 Class Test 2 / Main Exam (Second Half Syllabus)
            </span>
            <span class="text-xs text-emerald-700 font-bold">Weeks 5 to 8 (Post-CT1 Topics)</span>
          </div>
          <p class="text-xs text-slate-600 mt-1 font-medium leading-relaxed">${ct2Desc}</p>
        </div>
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-center">
          ${ct2Files.length} Test Files Available
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" id="ct2FilesGrid"></div>
    `;
    examsGrid.appendChild(section2);
    const grid2 = section2.querySelector('#ct2FilesGrid');
    ct2Files.forEach(f => grid2.appendChild(createExamCard(f)));
  }

  // 3. Render Other Exam Files
  if (otherFiles.length > 0) {
    const section3 = document.createElement('div');
    section3.className = "bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4";
    section3.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 class="text-sm font-bold text-slate-800">📋 Additional Assessments & Archived Exams</h4>
        <span class="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
          ${otherFiles.length} Files
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="otherFilesGrid"></div>
    `;
    examsGrid.appendChild(section3);
    const grid3 = section3.querySelector('#otherFilesGrid');
    otherFiles.forEach(f => grid3.appendChild(createExamCard(f)));
  }

  // Fallback if no CT 1 / CT 2 grouping was matched but exam files exist
  if (ct1Files.length === 0 && ct2Files.length === 0 && otherFiles.length === 0) {
    const flatGrid = document.createElement('div');
    flatGrid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    examFiles.forEach(f => flatGrid.appendChild(createExamCard(f)));
    examsGrid.appendChild(flatGrid);
  }
}

// VIEW 3: WORKSHEETS & SOLUTIONS
function renderWorksheets(worksheetFiles, cls) {
  if (!worksheetsGrid) return;
  worksheetsGrid.innerHTML = '';

  if (worksheetFiles.length === 0) {
    if (currentTerm === 'Term 2') {
      worksheetsGrid.innerHTML = `
        <div class="col-span-full text-center py-14 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 shadow-xs">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-200">
            ⏳
          </div>
          <h4 class="text-base sm:text-lg font-bold text-slate-900">Term 2 Worksheets In Progress for ${cls.name}</h4>
          <p class="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            As soon as AI agents generate Term 2 practice worksheets and teacher answer keys, running <strong>sync-portal.bat</strong> will automatically update them here.
          </p>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button onclick="switchTerm('Term 1')" class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all shadow-sm">
              📦 View Term 1 Archive Worksheets & Solutions
            </button>
          </div>
        </div>
      `;
    } else {
      worksheetsGrid.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <span class="text-4xl">📚</span>
          <p class="text-sm font-semibold text-slate-600 mt-2">No worksheets uploaded yet for this class.</p>
        </div>
      `;
    }
    return;
  }

  worksheetFiles.forEach(f => {
    const isDocx = f.ext === '.docx';
    const isPdf = f.ext === '.pdf';
    const badgeColor = f.isAnswerKey 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
      : 'bg-indigo-100 text-indigo-800 border-indigo-300';

    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="w-10 h-10 rounded-xl ${isDocx ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} flex items-center justify-center font-bold text-xs shrink-0 border ${isDocx ? 'border-blue-200' : 'border-red-200'}">
            ${isDocx ? 'DOCX' : isPdf ? 'PDF' : 'FILE'}
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeColor}">
            ${f.badge}
          </span>
        </div>

        <h4 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2" title="${f.name}">
          ${f.name}
        </h4>
        <div class="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
          <span>${f.term}</span>
          <span>•</span>
          <span>${f.sizeFormatted}</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button onclick="openPreview('${safeAttr(f.url)}', '${safeAttr(f.name)}', '${safeAttr(f.badge)}', '${safeAttr(f.term + ' • ' + f.sizeFormatted)}')" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold border border-indigo-200 transition-all active:scale-95" title="View worksheet in browser without downloading">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>👁️ Preview</span>
        </button>
        <a href="${f.url}" download="${f.name}" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95" title="Download to device">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>Download</span>
        </a>
      </div>
    `;

    worksheetsGrid.appendChild(card);
  });
}

// VIEW 4: ALL FILES DIRECT DOWNLOAD TABLE
function renderAllFiles(files) {
  if (!allFilesTableBody) return;
  allFilesTableBody.innerHTML = '';

  let filtered = files;
  if (fileFilterType === 'docx') {
    filtered = files.filter(f => f.ext === '.docx');
  } else if (fileFilterType === 'pdf') {
    filtered = files.filter(f => f.ext === '.pdf');
  } else if (fileFilterType === 'answer') {
    filtered = files.filter(f => f.isAnswerKey);
  }

  if (allFilesCountBadge) {
    allFilesCountBadge.textContent = `${filtered.length} Files`;
  }

  if (filtered.length === 0) {
    allFilesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
          No files found in this category.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(f => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/80 transition-colors";

    const isDocx = f.ext === '.docx';
    const isPdf = f.ext === '.pdf';

    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg ${isDocx ? 'bg-blue-100 text-blue-700' : isPdf ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'} font-bold text-[10px] flex items-center justify-center shrink-0">
            ${isDocx ? 'DOC' : isPdf ? 'PDF' : 'FILE'}
          </span>
          <span class="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1 max-w-xs sm:max-w-md" title="${f.name}">
            ${f.name}
          </span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${f.isAnswerKey ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
          ${f.badge}
        </span>
      </td>
      <td class="py-3 px-4 text-xs font-semibold text-slate-600">
        ${f.term}
      </td>
      <td class="py-3 px-4 text-xs text-slate-500 font-medium">
        ${f.sizeFormatted}
      </td>
      <td class="py-3 px-4 text-right">
        <div class="inline-flex items-center gap-1.5">
          <button onclick="openPreview('${safeAttr(f.url)}', '${safeAttr(f.name)}', '${safeAttr(f.badge)}', '${safeAttr(f.term + ' • ' + f.sizeFormatted)}')" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all border border-indigo-200" title="Preview file in browser without downloading">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>Preview</span>
          </button>
          <a href="${f.url}" download="${f.name}" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white font-bold text-xs transition-all border border-slate-200" title="Download to device">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span class="hidden sm:inline">Download</span>
          </a>
        </div>
      </td>
    `;

    allFilesTableBody.appendChild(tr);
  });
}

function filterFilesByType(type) {
  fileFilterType = type;
  document.querySelectorAll('.fileFilterBtn').forEach(btn => {
    btn.className = "fileFilterBtn px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium";
  });
  if (event && event.target) {
    event.target.className = "fileFilterBtn px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs";
  }
  
  const cls = getCurrentClassData();
  if (cls) renderAllFiles(cls.files || []);
}

// REALTIME SEARCH HANDLER
function handleSearch(query) {
  searchQuery = query.trim().toLowerCase();
  
  if (searchQuery.length > 0) {
    if (clearSearchBtn) clearSearchBtn.classList.remove('hidden');
    if (searchResultsSection) searchResultsSection.classList.remove('hidden');
    if (classDetailSection) classDetailSection.classList.add('hidden');
    performSearch(searchQuery);
  } else {
    clearSearch();
  }
}

function clearSearch() {
  searchQuery = '';
  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
  if (searchResultsSection) searchResultsSection.classList.add('hidden');
  if (classDetailSection) classDetailSection.classList.remove('hidden');
}

function performSearch(query) {
  if (!searchResultsGrid) return;
  searchResultsGrid.innerHTML = '';

  const results = [];

  window.SCHOOL_DATA.classes.forEach(cls => {
    (cls.files || []).forEach(f => {
      if (f.name.toLowerCase().includes(query) || f.badge.toLowerCase().includes(query)) {
        results.push({ type: 'file', class: cls, file: f });
      }
    });

    const allWeeks = [...(cls.term2Weeks || []), ...(cls.term1Weeks || [])];
    const uniqueWeeks = allWeeks.length > 0 ? allWeeks : (cls.weeks || []);
    uniqueWeeks.forEach(w => {
      (w.days || []).forEach(d => {
        if (
          w.title.toLowerCase().includes(query) || 
          (d.topic && d.topic.toLowerCase().includes(query)) ||
          (d.book && d.book.toLowerCase().includes(query)) ||
          (d.pages && d.pages.toLowerCase().includes(query)) ||
          (d.homework && d.homework.toLowerCase().includes(query))
        ) {
          results.push({ type: 'day', class: cls, week: w, day: d });
        }
      });
    });
  });

  if (searchResultCount) {
    searchResultCount.textContent = `${results.length} results found`;
  }

  if (results.length === 0) {
    searchResultsGrid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
        <span class="text-4xl">🔎</span>
        <p class="text-sm font-semibold text-slate-700 mt-2">No files or lesson plans found matching "${query}".</p>
      </div>
    `;
    return;
  }

  results.forEach(res => {
    const card = document.createElement('div');
    card.className = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between";

    if (res.type === 'file') {
      const f = res.file;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${res.class.name}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">${f.badge}</span>
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">${f.name}</h4>
          <p class="text-[11px] text-slate-500 mt-1">${f.sizeFormatted} • ${f.term}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
          <button onclick="openPreview('${safeAttr(f.url)}', '${safeAttr(f.name)}', '${safeAttr(f.badge)}', '${safeAttr(res.class.name + ' • ' + f.term)}')" class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all">👁️ Preview</button>
          <a href="${f.url}" download="${f.name}" class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all">Download</a>
        </div>
      `;
    } else {
      const w = res.week;
      const d = res.day;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">${res.class.name}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Week ${w.week} • ${d.dayLabel}</span>
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">${d.topic}</h4>
          <p class="text-[11px] text-indigo-700 font-semibold mt-1">📖 ${d.book} (${d.pages})</p>
          <p class="text-[11px] text-slate-600 mt-1 line-clamp-2">Homework: ${d.homework || ''}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 flex justify-end">
          <button onclick="selectClass('${res.class.id}')" class="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900">Go to Class</button>
        </div>
      `;
    }

    searchResultsGrid.appendChild(card);
  });
}

// 1-CLICK CLIPBOARD COPY HELPER
function copyToClipboard(encodedText, label) {
  const text = decodeURIComponent(encodedText);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`);
    }).catch(err => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`${label} copied to clipboard!`);
  } catch (err) {
    showToast(`Failed to copy to clipboard!`);
  }
  document.body.removeChild(textArea);
}

// TOAST NOTIFICATION
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2800);
}

// SAFE ATTRIBUTE ENCODING (PREVENTS HTML BREAKAGE)
function safeAttr(str) {
  if (!str) return '';
  return encodeURIComponent(String(str)).replace(/'/g, '%27');
}

// UNIVERSAL IN-BROWSER PREVIEW SYSTEM (NO DOWNLOAD REQUIRED)
function openPreview(encodedUrl, encodedName, encodedBadge = '', encodedMeta = '') {
  const fileUrl = decodeURIComponent(encodedUrl || '');
  const fileName = decodeURIComponent(encodedName || 'Document');
  const badge = decodeURIComponent(encodedBadge || 'Resource');
  const meta = decodeURIComponent(encodedMeta || 'In-Browser Instant Viewer');

  const modal = document.getElementById('previewModal');
  const titleEl = document.getElementById('previewFileName');
  const badgeEl = document.getElementById('previewFileBadge');
  const infoEl = document.getElementById('previewFileInfo');
  const iconEl = document.getElementById('previewFileIcon');
  const bodyEl = document.getElementById('previewModalBody');
  const downloadBtn = document.getElementById('previewDownloadBtn');
  const newTabBtn = document.getElementById('previewNewTabBtn');
  const noticeEl = document.getElementById('previewBannerNotice');
  const noticeTextEl = document.getElementById('previewBannerText');

  if (!modal || !bodyEl) return;

  titleEl.textContent = fileName;
  titleEl.title = fileName;
  badgeEl.textContent = badge;
  infoEl.textContent = meta;

  downloadBtn.href = fileUrl;
  downloadBtn.setAttribute('download', fileName);

  const lower = fileUrl.toLowerCase();
  const isPdf = lower.endsWith('.pdf');
  const isImage = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif');
  const isDocx = lower.endsWith('.docx') || lower.endsWith('.doc');

  noticeEl.classList.add('hidden');

  if (isPdf) {
    iconEl.textContent = '📑';
    badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-400/30';
    newTabBtn.href = fileUrl;
    newTabBtn.classList.remove('hidden');

    bodyEl.innerHTML = `
      <iframe src="${fileUrl}#toolbar=1" class="w-full h-full rounded-2xl border-0 shadow-inner bg-white" title="${fileName}"></iframe>
    `;
  } else if (isImage) {
    iconEl.textContent = '🖼️';
    badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30';
    newTabBtn.href = fileUrl;
    newTabBtn.classList.remove('hidden');

    bodyEl.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto">
        <img src="${fileUrl}" alt="${fileName}" class="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-xl ring-1 ring-slate-200">
        <span class="mt-3 text-xs text-slate-500 font-medium">Textbook Page / Photo Reference</span>
      </div>
    `;
  } else if (isDocx) {
    iconEl.textContent = '📝';
    badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30';
    
    // Automatically match with pre-converted PDF for instant high-fidelity viewing
    const pdfCandidate = fileUrl.replace(/\.docx$/i, '.pdf').replace(/\.doc$/i, '.pdf');
    newTabBtn.href = pdfCandidate;
    newTabBtn.classList.remove('hidden');

    noticeEl.classList.remove('hidden');
    noticeTextEl.textContent = '👁️ Instant PDF preview of this Microsoft Word document.';

    bodyEl.innerHTML = `
      <iframe src="${pdfCandidate}#toolbar=1" class="w-full h-full rounded-2xl border-0 shadow-inner bg-white" title="${fileName}"></iframe>
    `;
  } else {
    iconEl.textContent = '📁';
    badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-400/30';
    newTabBtn.href = fileUrl;
    newTabBtn.classList.remove('hidden');

    bodyEl.innerHTML = `
      <div class="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
        <span class="text-5xl block mb-3">📄</span>
        <h4 class="text-base font-bold text-slate-900 mb-1">${fileName}</h4>
        <p class="text-xs text-slate-500 mb-5">Click below to open in dedicated tab or download directly.</p>
        <div class="flex items-center justify-center gap-2">
          <a href="${fileUrl}" target="_blank" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">Open in Tab</a>
          <a href="${fileUrl}" download class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900">Download File</a>
        </div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  const bodyEl = document.getElementById('previewModalBody');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  if (bodyEl) {
    bodyEl.innerHTML = '';
  }
}

function handlePreviewBackdropClick(e) {
  if (e.target && e.target.id === 'previewModal') {
    closePreviewModal();
  }
}

// ESC Key closes Preview Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePreviewModal();
  }
});
