import { type RequestHandler, routeLoader$ } from '@builder.io/qwik-city';
import { component$, useVisibleTask$ } from '@builder.io/qwik';
import Hukamnama from '~/components/hukamnama/hukamnama';
import Lotus from '~/components/icons/lotus';
import { renderSVG } from 'uqr';

const recommendedFontSize = (numChars: number) => {
  // return '2.155vh';
  const factor = 14.2452 - 0.814962 * Math.log(8.36441 * numChars - 691962);
  return `${numChars < 107297 ? 4.25 : factor < 1.33 ? 1.33 : factor}vh`;
};

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7 * 2,
    maxAge: 60 * 60 * 24 * 2,
  });
  cacheControl(
    {
      staleWhileRevalidate: 60 * 60 * 24 * 7 * 2,
      maxAge: 60 * 60 * 24 * 2,
    },
    'CDN-Cache-Control',
  );
};

export const useLineGroupsApi = routeLoader$(async (requestEvent) => {
  const lineGroups = requestEvent.params.id;

  const fetchLineGroups = async (id: string) => {
    return fetch(`https://shabados.com/api/g/${id}`).then((res) => res.json());
  };

  if (lineGroups !== undefined) {
    return {
      linegroups: lineGroups,
      date: requestEvent.query.get('date') || undefined,
      qr: requestEvent.query.get('qr') || undefined,
      pb: requestEvent.query.get('pb') || undefined,
      data: await Promise.all(lineGroups.split(',').map(fetchLineGroups)),
    };
  }

  // unknown error
  return {};
});

const toGurmukhiNumerals = (input: string): string => {
  const numeralMap: { [key: string]: string } = {
    '1': '੧',
    '2': '੨',
    '3': '੩',
    '4': '੪',
    '5': '੫',
    '6': '੬',
    '7': '੭',
    '8': '੮',
    '9': '੯',
    '0': '੦',
  };

  return input.replace(/\d/g, (digit) => numeralMap[digit]);
};

export default component$(() => {
  const signal = useLineGroupsApi();

  const lineGroups = signal.value.data!;
  const svg = renderSVG(
    `https://shabados.com/app/g/${decodeURI(signal.value.linegroups!)}`,
    {
      border: 4,
    },
  );

  const larivar = lineGroups.reduce(
    (total, lineGroup) =>
      total +
      lineGroup.data.default.src.reduce(
        (acc: string, obj: any) =>
          acc +
          obj.src.data
            .replaceAll(' ', '')
            .replaceAll(',', '')
            .replaceAll(';', '')
            .replaceAll('.', ''),
        '',
      ),
    '',
  );
  const baseCharMarks = [
    '੍ਹ',
    '੍ਰ',
    '੍ਵ',
    '੍ਟ',
    '੍ਤ',
    '੍ਨ',
    '੍ਚ',
    '਼',
    'ੑ',
    'ੵ',
    'ੇ',
    'ੈ',
    'ੋ',
    'ੌ',
    'ੁ',
    'ੂ',
    'ਁ',
    'ੱ',
    'ਂ',
    'ੰ',
    'ਃ',
  ];
  const baseCharMarksRegex = new RegExp(baseCharMarks.join('|'), 'g');
  const larivarChars = larivar.replace(baseCharMarksRegex, '');

  const pWidth = ['ਲ'];
  const pWidthRegex = new RegExp(pWidth.join('|'), 'g');
  const pWidthCount = (larivarChars.match(pWidthRegex) || []).length;

  const ppWidth = ['ਅ', 'ਐ', 'ਔ', 'ਗ', 'ਯ', 'ਘ'];
  const ppWidthRegex = new RegExp(ppWidth.join('|'), 'g');
  const ppWidthCount = (larivarChars.match(ppWidthRegex) || []).length;

  const pppWidth = ['ਇ', 'ਈ'];
  const pppWidthRegex = new RegExp(pppWidth.join('|'), 'g');
  const pppWidthCount = (larivarChars.match(pppWidthRegex) || []).length;

  const ppppWidth = ['ੴ'];
  const ppppWidthRegex = new RegExp(ppppWidth.join('|'), 'g');
  const ppppWidthCount = (larivarChars.match(ppppWidthRegex) || []).length;

  const mWidth = ['੦', '੨', '੩', '੬', '੮', '੯'];
  const mWidthRegex = new RegExp(mWidth.join('|'), 'g');
  const mWidthCount = (larivarChars.match(mWidthRegex) || []).length;

  const mmWidth = ['੧', '॥'];
  const mmWidthRegex = new RegExp(mmWidth.join('|'), 'g');
  const mmWidthCount = (larivarChars.match(mmWidthRegex) || []).length;

  const mmmWidth = ['ਿ', 'ੀ', 'ਾ'];
  const mmmWidthRegex = new RegExp(mmmWidth.join('|'), 'g');
  const mmmWidthCount = (larivarChars.match(mmmWidthRegex) || []).length;

  const nWidthCount =
    larivarChars.length -
    pWidthCount -
    ppWidthCount -
    pppWidthCount -
    ppppWidthCount -
    mWidthCount -
    mmWidthCount -
    mmmWidthCount;

  const numChars =
    nWidthCount * 560 +
    pWidthCount * 640 +
    ppWidthCount * 702 +
    pppWidthCount * 797 +
    ppppWidthCount * 1021 +
    mWidthCount * 490 +
    mmWidthCount * 457 +
    mmmWidthCount * 240;

  useVisibleTask$(() => {
    const progressBar = document.querySelector('#progress-bar') as HTMLElement;

    const timeout = { ms: 0, maximum: 90000, minimum: 4000 };

    const body = document.querySelector('.exposition');
    const bodyHeight = body?.getBoundingClientRect().height;
    const lines = body?.querySelectorAll('.line');
    const lineInfo = { index: 0, top: 0 };

    const animateProgressBar = () => {
      if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.opacity = '40%';

        progressBar.animate(
          [
            { width: '0%', opacity: '40%' },
            { width: '100%', opacity: '100%' },
          ],
          {
            duration: timeout.ms,
            iterations: 1,
          },
        );
      }
    };

    const goNextLine = () => {
      const scrollToNextLine = () => {
        const currentLine = lines![lineInfo.index];
        const gurmukhiLine = currentLine.querySelector('.bold');
        if (progressBar) currentLine.insertBefore(progressBar!, gurmukhiLine);
        lineInfo.top = currentLine.getBoundingClientRect().top + 2;
        console.log(lineInfo.top);
        const lineHeight = currentLine.getBoundingClientRect().height;
        const factor = lineHeight > bodyHeight! ? 1 : lineHeight / bodyHeight!;
        timeout.ms =
          factor * timeout.maximum < timeout.minimum
            ? timeout.minimum
            : factor * timeout.maximum;

        console.log(timeout.ms);

        currentLine.scrollIntoView({ behavior: 'smooth' });

        animateProgressBar();

        // Increment the index or reset to 0 if at the end
        lineInfo.index = (lineInfo.index + 1) % lines!.length;

        // Schedule the next scroll
        setTimeout(scrollToNextLine, timeout.ms);
      };

      scrollToNextLine();
    };

    goNextLine();
  });

  const fontSize = recommendedFontSize(numChars);
  return (
    <>
      {!(signal.value.qr && parseInt(signal.value.qr) == 0) && (
        <div class='qrcode' dangerouslySetInnerHTML={svg} />
      )}

      <div class='hukamnama'>
        <div>
          <div class='header'>
            <div>
              {signal.value.date && <p>{signal.value.date}</p>}
              <h1>
                <Lotus /> ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ <Lotus />
              </h1>
              <p>
                ਅੰਗ{' '}
                {toGurmukhiNumerals(
                  lineGroups[0].meta.source.pp.sort()[0].toString(),
                )}
                {lineGroups[0].meta.source.pp.length == 2 &&
                  `-${toGurmukhiNumerals(
                    lineGroups[0].meta.source.pp.sort()[1].toString(),
                  )}`}
              </p>
            </div>
          </div>
          <div class='larivar' style={{ fontSize }}>
            {larivar}
          </div>
        </div>
        <div class='exposition'>
          {!(signal.value.pb && parseInt(signal.value.pb) == 0) && (
            <div id='progress-bar' />
          )}
          {lineGroups.map((lineGroup) => (
            <Hukamnama key={1} data={lineGroup} />
          ))}
        </div>
      </div>
    </>
  );
});
