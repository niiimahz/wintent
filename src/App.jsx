import { useState, useMemo, useCallback, useTransition } from 'react';
import { buildBaselineFn, computeMetrics, computeKPIs } from './utils/metrics.js';
import PageHome from './pages/PageHome.jsx';
import PageSummary from './pages/PageSummary.jsx';
import PageDetail from './pages/PageDetail.jsx';
import PageActionList from './pages/PageActionList.jsx';

const DEFAULT_SETTINGS = {
  brandTerms: [],
  transactionalWords: ['خرید', 'قیمت', 'حراج', 'تخفیف', 'اصل', 'ارزان', 'سفارش'],
  informationalWords: ['چیست', 'چگونه', 'آموزش', 'آدرس', 'فرق', 'مقایسه', 'نحوه'],
};

export default function App() {
  const [page, setPage] = useState(1);
  const [rawData, setRawData] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // Map<key, rowWithMetrics> — key = "q:label" or "p:label"
  const [actionList, setActionList] = useState(new Map());
  const [tableMode, setTableMode] = useState('queries');
  const [initialSort, setInitialSort] = useState(null);

  // Build site-specific baseline functions
  const queriesBaseline = useMemo(
    () => rawData?.queries?.length ? buildBaselineFn(rawData.queries) : () => 0,
    [rawData]
  );
  const pagesBaseline = useMemo(
    () => rawData?.pages?.length ? buildBaselineFn(rawData.pages) : () => 0,
    [rawData]
  );

  // Compute enriched rows (recomputes whenever settings change)
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
    // startTransition marks the page switch as non-urgent so the browser
    // stays responsive while React prepares the new page.
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

  const commonProps = {
    setPage,
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

  if (page === 1) {
    return (
      <PageHome
        onUpload={(d) => {
          setRawData(d);
          setPage(2);
        }}
      />
    );
  }

  if (page === 2) {
    return <PageSummary {...commonProps} navigateTo3={navigateTo3} />;
  }

  if (page === 3) {
    return (
      <PageDetail
        {...commonProps}
        initialSort={initialSort}
        setInitialSort={setInitialSort}
      />
    );
  }

  if (page === 4) {
    return <PageActionList {...commonProps} />;
  }

  return null;
}
