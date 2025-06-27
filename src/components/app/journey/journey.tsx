import {
  component$,
  useContext,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik';
import {
  UiContext,
  UserDataContext,
  getLocalStorage,
} from '~/routes/(app)/layout';
import styles from './journey.css?inline';
import X from '~/components/icons/ui/x';
import { useLocation } from '@builder.io/qwik-city';


const categoryLabels = {
  today: 'Today',
  yesterday: 'Yesterday', 
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  older: 'Older'
};

// Helper function to categorize dates
const getCategoryFromTimestamp = (timestamp: number, now: Date) => {
  const itemDate = new Date(timestamp);
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset time to start of day for comparison
  const resetTime = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };
  
  const itemDateStart = resetTime(new Date(itemDate));
  const todayStart = resetTime(new Date(today));
  const yesterdayStart = resetTime(new Date(yesterday));
  const weekStart = resetTime(new Date(startOfWeek));
  const monthStart = resetTime(new Date(startOfMonth));
  
  if (itemDateStart.getTime() === todayStart.getTime()) {
    return 'today';
  } else if (itemDateStart.getTime() === yesterdayStart.getTime()) {
    return 'yesterday';
  } else if (itemDateStart >= weekStart) {
    return 'thisWeek';
  } else if (itemDateStart >= monthStart) {
    return 'thisMonth';
  } else {
    return 'older';
  }
};

// Helper function to format time based on category
const formatTimeByCategory = (timestamp: number, category: string) => {
  const date = new Date(timestamp);
  
  switch (category) {
    case 'today':
      // Just show time for today's items
      return date.toLocaleTimeString([], { timeStyle: 'short', hour12 : true });
    
    case 'yesterday':
      // Show time for yesterday's items
      return date.toLocaleTimeString([], { timeStyle: 'short', hour12 : true });
    
    case 'thisWeek':
      // Show day of week + time for this week's items
      return date.toLocaleDateString([], { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    
    case 'thisMonth':
      // Show date + time for this month's items
      return date.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    
    case 'older':
      // Show full date + time for older items
      return date.toLocaleDateString([], { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    
    default:
      return date.toLocaleTimeString([], { timeStyle: 'short' });
  }
};

export default component$(() => {
  useStylesScoped$(styles);
  const userDataStore = useContext(UserDataContext);
  const uiStore = useContext(UiContext);
  const { url } = useLocation();

  useVisibleTask$(() => {
    userDataStore.history = getLocalStorage('userDataStore')['history'] ?? '{}';
  });

  const sortedHistory = Object.entries(userDataStore.history)
    .sort(([, a], [, b]) => (a['time'] as number) - (b['time'] as number))
    .reverse();

  // Categorize history items
  const now = new Date();
  const categorizedHistory = {
    today: [] as Array<[string, any]>,
    yesterday: [] as Array<[string, any]>,
    thisWeek: [] as Array<[string, any]>,
    thisMonth: [] as Array<[string, any]>,
    older: [] as Array<[string, any]>,
  };

  sortedHistory.forEach((item) => {
    const category = getCategoryFromTimestamp(Number(item[1]['time']), now);
    categorizedHistory[category].push(item);
  });



  return (
    <>
      <div class='modal-bg' onClick$={() => (uiStore.journey = false)} />
      <div class={`modal ${uiStore.scrollForward && 'fill'} `}>
        <article class='modal__header'>
          <h2 class='modal__title'>Journey</h2>
          <span
            dir='rtl'
            class='modal__close'
            onClick$={() => (uiStore.journey = false)}
          >
            <X />
          </span>
        </article>
        <article class='modal__article journey__items'>
          {Object.entries(categorizedHistory).map(([category, items]) => {
            if (items.length === 0) return null;
            
            return (
              <div key={category} class='journey__category'>
                <h3 class='journey__category__title'>{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                {items.map(([a, b]) => (
                  <a
                    href={url.pathname != a ? a : undefined}
                    key={a}
                    aria-disabled={url.pathname == a}
                    class={`journey__items__item ${url.pathname == a && `disabled`}`}
                  >
                    <span class='journey__items__item__title'>{b.title}</span>
                    <p class='small'>
                      {formatTimeByCategory(Number(b['time']), category)}
                    </p>
                  </a>
                ))}
              </div>
            );
          })}
        </article>
      </div>
    </>
  );
});
