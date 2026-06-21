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
import { GSCModal } from './components/GSCModal.jsx';

const DEFAULT_SETTINGS = {
  brandTerms: [],
  transactionalWords: ['خرید', 'قیمت', 'حراج', 'تخفیف', 'اصل', 'ارزان', 'سفارش'],
  informationalWords: ['چیست', 'چگونه', 'آموزش', 'آدرس', 'فرق', 'مقایسه', 'نحوه'],
};

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

async function signInWithGSC() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      scopes: GSC_SCOPE,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
}

export default function App() {
  // ── Auth ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [providerToken, setProviderToken] = useState(null);

  // ── App state ─────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [rawData, setRawData] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [actionList, setActionList] = useState(new Map());
  const [tableMode, setTableMode] = useState('queries');
  const [initialSort, setInitialSort] = useState(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [analysesVersion, setAnalysesVersion] = useState(0);

  // ── Modal state ───────────────────────────────────────
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGSCModal, setShowGSCModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameModalData, setNameModalData] = useState(null);

  // ── Auth listener ─────────────────────────────────────
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) sessionStorage.setItem('wintent_ref', refCode);

    // Check if user clicked "اتصال به سرچ کنسول" before redirect
    const gscPending = sessionStorage.getItem('wintent_gsc_pending');

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);

      if (session?.provider_token) {
        setProviderToken(session.provider_token);
        // If came back from GSC connect, open the modal automatically
        if (gscPending && u) {
          sessionStorage.removeItem('wintent_gsc_pending');
          setShowGSCModal(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (session?.provider_token) setProviderToken(session.provider_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Post-login side effects
  useEffect(() => {
    if (!user) return;

    const refCode = sessionStorage.getItem('wintent_ref');
    if (refCode) {
      sessionStorage.removeItem('wintent_ref');
      supabase.rpc('apply_referral', { ref_code: refCode });
    }
  }, [user]);

  // ── GSC connect (for existing users without token) ────
  const handleConnectGSC = useCallback(() => {
    sessionStorage.setItem('wintent_gsc_pending', '1');
    signInWithGSC();
  }, []);

  // ── GSC data received ─────────────────────────────────
  const handleGSCData = useCallback(async (data) => {
    setShowGSCModal(false);
    await handleUploadData(data);
  }, [user]); // eslint-disable-line

  // ── Core upload/analysis flow ─────────────────────────
  const handleUploadData = useCallback(async (parsedData) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const profile = await fetchProfile(user.id);
    const isComplete = profile?.phone_verified && profile?.phone && profile?.first_name && profile?.job_position && profile?.how_found;
    const baseLimit = isComplete ? 3 : 1;
    const maxAllowed = baseLimit + (profile?.extra_analyses ?? 0);
    const totalCreated = profile?.total_analyses_created ?? 0;

    if (totalCreated >= maxAllowed) {
      if (!isComplete) {
        alert('برای آنالیز بیشتر، ابتدا پروفایلت رو تو حساب کاربری تکمیل کن تا سقف به ۳ برسه.');
      } else {
        alert(`به سقف ${maxAllowed} آنالیز رسیدی. از طریق رفرال میتونی سقف رو بالاتر ببری.`);
      }
      setPage(5);
      return;
    }

    setNameModalData(parsedData);
    setShowNameModal(true);
  }, [user]);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  }

  // ── Save analysis ─────────────────────────────────────
  const saveAnalysis = async (name, data, currentUser) => {
    const u = currentUser || user;
    if (!u) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: saved, error } = await supabase.from('analyses').insert({
      user_id: u.id,
      name,
      queries_data: data.queries,
      pages_data: data.pages,
      chart_data: data.chart,
      settings,
    }).select('id').single();

    if (error) { console.error('Save analysis error:', error); return null; }
    return saved?.id ?? null;
  };

  // ── Name modal confirmed ──────────────────────────────
  const handleNameSave = useCallback(async (name) => {
    const data = nameModalData;
    const currentUser = user;
    setShowNameModal(false);
    setNameModalData(null);
    setRawData(data);
    setPage(2);
    const id = await saveAnalysis(name, data, currentUser);
    if (id) {
      setCurrentAnalysisId(id);
      setAnalysesVersion(v => v + 1);
    }
  }, [nameModalData, user, settings]);

  // ── Load existing analysis ────────────────────────────
  const handleLoadAnalysis = useCallback(({ rawData: d, settings: s, analysisId }) => {
    setRawData(d);
    if (s) setSettings(s);
    setCurrentAnalysisId(analysisId);
    setPage(2);
  }, []);

  // ── Sign out ──────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProviderToken(null);
    setRawData(null);
    setCurrentAnalysisId(null);
    setPage(1);
  }, []);

  // ── Metrics ───────────────────────────────────────────
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
    setPage, user, data: rawData, settings, setSettings,
    queriesWithMetrics, pagesWithMetrics, kpis,
    actionList, toggleActionList, tableMode, setTableMode, isPending,
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
      {showNameModal && (
        <NameAnalysisModal onSave={handleNameSave} />
      )}
      {showGSCModal && providerToken && (
        <GSCModal
          providerToken={providerToken}
          onData={handleGSCData}
          onClose={() => setShowGSCModal(false)}
          onReconnect={handleConnectGSC}
        />
      )}

      {page === 1 && (
        <PageHome
          user={user}
          setPage={setPage}
          providerToken={providerToken}
          onConnectGSC={handleConnectGSC}
          onOpenGSC={() => setShowGSCModal(true)}
        />
      )}
      {page === 2 && <PageSummary {...commonProps} navigateTo3={navigateTo3} />}
      {page === 3 && <PageDetail {...commonProps} initialSort={initialSort} setInitialSort={setInitialSort} />}
      {page === 4 && <PageActionList {...commonProps} />}
      {page === 5 && (
        <PageAccount
          key={analysesVersion}
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
