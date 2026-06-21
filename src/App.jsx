import { useState, useMemo, useCallback, useTransition, useEffect } from 'react';
import { buildBaselineFn, computeMetrics, computeKPIs } from './utils/metrics.js';
import { supabase } from './lib/supabase.js';
import PageHome from './pages/PageHome.jsx';
import PageSummary from './pages/PageSummary.jsx';
import PageDetail from './pages/PageDetail.jsx';
import PageActionList from './pages/PageActionList.jsx';
import PageAccount from './pages/PageAccount.jsx';
import { LoginModal } from './components/LoginModal.jsx';
import { NameAnalysisModal } from './components/NameAnalysisModal.jsx';

const DEFAULT_SETTINGS = {
  brandTerms: [],
  transactionalWords: ['خرید', 'قیمت', 'حراج', 'تخفیف', 'اصل', 'ارزان', 'سفارش'],
  informationalWords: ['چیست', 'چگونه', 'آموزش', 'آدرس', 'فرق', 'مقایسه', 'نحوه'],
};

export default function App() {
  // ── Auth ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── App state ─────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [rawData, setRawData] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [actionList, setActionList] = useState(new Map());
  const [tableMode, setTableMode] = useState('queries');
  const [initialSort, setInitialSort] = useState(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

  // ── Modal state ───────────────────────────────────────
  const [showLoginModal, setShowLoginModal] = useState(false);
  // pendingRawData: data that was uploaded but user wasn't logged in yet
  const [pendingRawData, setPendingRawData] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  // nameModalData: rawData to save once named (set just before showing the modal)
  const [nameModalData, setNameModalData] = useState(null);

  // ── Auth listener ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);

      // After OAuth redirect: if we had pending data, trigger name modal
      if (u && pendingRawData) {
        setNameModalData(pendingRawData);
        setShowNameModal(true);
        setPendingRawData(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  // After Google OAuth redirect back, pendingRawData may be in sessionStorage
  useEffect(() => {
    if (!user) return;
    const stored = sessionStorage.getItem('wintent_pending_raw');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        sessionStorage.removeItem('wintent_pending_raw');
        setNameModalData(data);
        setShowNameModal(true);
      } catch { /* ignore */ }
    }
  }, [user]);

  // ── Handle file upload ────────────────────────────────
  const handleUpload = useCallback(async (parsedData) => {
    if (!user) {
      // Save to sessionStorage so it survives the OAuth redirect
      sessionStorage.setItem('wintent_pending_raw', JSON.stringify(parsedData));
      setShowLoginModal(true);
      // Also keep in memory in case user doesn't redirect yet
      setPendingRawData(parsedData);
    } else {
      // Check analysis limit
      const profile = await fetchProfile(user.id);
      const hasPhone = profile?.phone_verified && profile?.phone;
      const maxAllowed = hasPhone ? 3 : 1;

      const { count } = await supabase
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count >= maxAllowed) {
        if (!hasPhone) {
          alert('برای آنالیز بیشتر، ابتدا شماره موبایل خود را در بخش حساب کاربری ثبت کنید.');
          setPage(5);
        } else {
          alert('به حداکثر ۳ آنالیز رسیدی. یکی را حذف کن.');
          setPage(5);
        }
        return;
      }

      setNameModalData(parsedData);
      setShowNameModal(true);
    }
  }, [user]);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  }

  // ── Save analysis to Supabase ─────────────────────────
  const saveAnalysis = async (name, data, currentUser) => {
    const u = currentUser || user;
    if (!u) return null;
    const { data: saved, error } = await supabase.from('analyses').insert({
      user_id: u.id,
      name,
      queries_data: data.queries,
      pages_data: data.pages,
      chart_data: data.chart,
      settings: settings,
    }).select('id').single();
    if (error) { console.error('Save analysis error:', error); return null; }
    return saved?.id ?? null;
  };

  // ── Name modal: user confirmed name ───────────────────
  const handleNameSave = useCallback(async (name) => {
    // Capture data before clearing state
    const data = nameModalData;
    const currentUser = user;
    setShowNameModal(false);
    setNameModalData(null);
    // Show results immediately, save in background
    setRawData(data);
    setPage(2);
    const id = await saveAnalysis(name, data, currentUser);
    if (id) setCurrentAnalysisId(id);
  }, [nameModalData, user, settings]);

  // ── Name modal: user skipped naming ───────────────────
  const handleNameSkip = useCallback(() => {
    setShowNameModal(false);
    const data = nameModalData;
    setNameModalData(null);
    setRawData(data);
    setPage(2);
  }, [nameModalData]);

  // ── Load existing analysis from account page ──────────
  const handleLoadAnalysis = useCallback(({ rawData: d, settings: s, analysisId, analysisName }) => {
    setRawData(d);
    if (s) setSettings(s);
    setCurrentAnalysisId(analysisId);
    setPage(2);
  }, []);

  // ── Sign out ──────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRawData(null);
    setCurrentAnalysisId(null);
    setPage(1);
  }, []);

  // ── Metrics computation ───────────────────────────────
  const queriesBaseline = useMemo(
    () => rawData?.queries?.length ? buildBaselineFn(rawData.queries) : () => 0,
    [rawData]
  );
  const pagesBaseline = useMemo(
    () => rawData?.pages?.length ? buildBaselineFn(rawData.pages) : () => 0,
    [rawData]
  );
  const queriesWithMetrics = useMemo(
    () => rawData?.queries ? computeMetrics(rawData.queries, queriesBaseline, settings, true) : [],
    [rawData, queriesBaseline, settings]
  );
  const pagesWithMetrics = useMemo(
    () => rawData?.pages ? computeMetrics(rawData.pages, pagesBaseline, settings, false) : [],
    [rawData, pagesBaseline, settings]
  );
  const kpis = useMemo(
    () => queriesWithMetrics.length ? computeKPIs(queriesWithMetrics, settings) : null,
    [queriesWithMetrics, settings]
  );

  const [isPending, startTransition] = useTransition();

  const navigateTo3 = useCallback((sortKey, sortDir = 'desc') => {
    startTransition(() => {
      setInitialSort({ key: sortKey, dir: sortDir });
      setPage(3);
    });
  }, []);

  const toggleActionList = useCallback((key, row) => {
    setActionList(prev => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, row);
      return next;
    });
  }, []);

  // ── Loading screen ────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ECA72C', letterSpacing: '-1px', marginBottom: 16 }}>wintent</div>
          <div style={{ width: 32, height: 32, border: '3px solid #e0e0e0', borderTop: '3px solid #ECA72C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const commonProps = {
    setPage,
    user,
    data: rawData,
    settings,
    setSettings,
    queriesWithMetrics,
    pagesWithMetrics,
    kpis,
    actionList,
    toggleActionList,
    tableMode,
    setTableMode,
    isPending,
  };

  return (
    <>
      {/* Modals (rendered on top of any page) */}
      {showLoginModal && (
        <LoginModal onClose={() => {
          setShowLoginModal(false);
          // Let them see results without saving
          if (pendingRawData) {
            setRawData(pendingRawData);
            setPendingRawData(null);
            setPage(2);
          }
        }} />
      )}
      {showNameModal && (
        <NameAnalysisModal onSave={handleNameSave} onSkip={handleNameSkip} />
      )}

      {page === 1 && (
        <PageHome onUpload={handleUpload} user={user} setPage={setPage} />
      )}
      {page === 2 && (
        <PageSummary {...commonProps} navigateTo3={navigateTo3} />
      )}
      {page === 3 && (
        <PageDetail {...commonProps} initialSort={initialSort} setInitialSort={setInitialSort} />
      )}
      {page === 4 && (
        <PageActionList {...commonProps} />
      )}
      {page === 5 && (
        <PageAccount
          setPage={setPage}
          user={user}
          actionList={actionList}
          onLoadAnalysis={handleLoadAnalysis}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
}
