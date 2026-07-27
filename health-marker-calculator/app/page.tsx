"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Status = "low" | "normal" | "high";

type Marker = {
  id: string;
  name: string;
  unit: string;
  min?: number;
  max?: number;
  step: string;
  placeholder: string;
  low: string;
  normal: string;
  high: string;
};

type Group = {
  title: string;
  description: string;
  markers: Marker[];
};

const TELEGRAM_URL =
  "https://t.me/ilya_yaroshevich?text=%D0%98%D0%BB%D1%8C%D1%8F%2C%20%D1%8F%20%D0%BF%D1%80%D0%BE%D1%88%D1%91%D0%BB%20%D0%BA%D0%B0%D0%BB%D1%8C%D0%BA%D1%83%D0%BB%D1%8F%D1%82%D0%BE%D1%80%20%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7%D0%BE%D0%B2.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BD%D1%8F%D1%82%D1%8C%2C%20%D1%87%D1%82%D0%BE%20%D0%B4%D0%B5%D0%BB%D0%B0%D1%82%D1%8C%20%D0%B4%D0%B0%D0%BB%D1%8C%D1%88%D0%B5.";
const COACHING_URL =
  "https://t.me/ilya_yaroshevich?text=%D0%98%D0%BB%D1%8C%D1%8F%2C%20%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B2%D0%B5%D1%80%D0%BD%D1%83%D1%82%D1%8C%20%D1%8D%D0%BD%D0%B5%D1%80%D0%B3%D0%B8%D1%8E%2C%20%D1%81%D0%BE%D0%BD%20%D0%B8%20%D1%84%D0%BE%D1%80%D0%BC%D1%83.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BE%D0%B1%D1%81%D1%83%D0%B4%D0%B8%D1%82%D1%8C%20%D1%81%D0%BE%D0%BF%D1%80%D0%BE%D0%B2%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5.";

const groups: Group[] = [
  {
    title: "Половые гормоны",
    description: "Андрогенный статус и баланс половых гормонов",
    markers: [
      {
        id: "test-total",
        name: "Тестостерон общий",
        unit: "нмоль/л",
        min: 12,
        max: 35,
        step: "0.1",
        placeholder: "15.4",
        low: "Показатель ниже усреднённого диапазона. На результат могут влиять сон, дефицит калорий, стресс, лишний вес и время сдачи. Для полной картины сопоставьте его с ЛГ, ФСГ и ГСПГ.",
        normal: "Показатель находится в усреднённом диапазоне. Оценивайте его вместе с симптомами, свободным тестостероном и ГСПГ.",
        high: "Показатель выше усреднённого диапазона. Если вы не используете препараты тестостерона, результат стоит перепроверить в тех же условиях.",
      },
      {
        id: "test-free",
        name: "Тестостерон свободный",
        unit: "пг/мл",
        min: 4.5,
        max: 42,
        step: "0.1",
        placeholder: "12.0",
        low: "Низкое значение может быть связано с высоким ГСПГ или снижением общего тестостерона. Интерпретируйте вместе с общим тестостероном и ГСПГ.",
        normal: "Показатель находится в усреднённом диапазоне. Метод измерения и референсы конкретной лаборатории имеют значение.",
        high: "Высокое значение нередко связано с низким ГСПГ или экзогенным введением гормонов. Сопоставьте его с общим тестостероном, ГСПГ и текущим протоколом.",
      },
      {
        id: "estradiol",
        name: "Эстрадиол (Е2)",
        unit: "пмоль/л",
        min: 40,
        max: 150,
        step: "1",
        placeholder: "85",
        low: "Низкий эстрадиол может сопровождаться ухудшением самочувствия, либидо и состояния суставов. Не корректируйте показатель самостоятельно.",
        normal: "Показатель находится в усреднённом диапазоне. Его важно оценивать вместе с тестостероном и симптомами.",
        high: "Повышение может быть связано с лишним весом, особенностями обмена гормонов или применяемой терапией. Оценивайте вместе с симптомами и текущим протоколом.",
      },
    ],
  },
  {
    title: "Гипофизарные гормоны",
    description: "Сигналы, регулирующие работу половой системы",
    markers: [
      {
        id: "lh",
        name: "ЛГ",
        unit: "МЕ/л",
        min: 1.7,
        max: 8.6,
        step: "0.1",
        placeholder: "4.2",
        low: "Низкий ЛГ требует оценки вместе с тестостероном и ФСГ. Причины могут быть функциональными или связанными с гипофизом.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный ЛГ оценивают вместе с уровнем тестостерона. Он может отражать усиленную стимуляцию половых желёз.",
      },
      {
        id: "fsh",
        name: "ФСГ",
        unit: "МЕ/л",
        min: 1.5,
        max: 12.4,
        step: "0.1",
        placeholder: "3.5",
        low: "Низкий ФСГ требует совместной оценки с ЛГ и половыми гормонами, особенно при вопросах фертильности.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный ФСГ может быть важен при оценке функции яичек и фертильности. Сопоставьте его с ЛГ, тестостероном и задачами по фертильности.",
      },
      {
        id: "prolactin",
        name: "Пролактин",
        unit: "мМЕ/л",
        min: 53,
        max: 360,
        step: "1",
        placeholder: "180",
        low: "Низкое значение обычно оценивают в контексте симптомов и других гормонов.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Пролактин чувствителен к стрессу, недосыпу, сексуальной активности и тренировке накануне. Часто нужен повторный анализ в спокойных условиях.",
      },
    ],
  },
  {
    title: "Транспортные белки и кровь",
    description: "Доступность гормонов и вязкость крови",
    markers: [
      {
        id: "shbg",
        name: "ГСПГ",
        unit: "нмоль/л",
        min: 13,
        max: 71,
        step: "0.1",
        placeholder: "35",
        low: "Низкий ГСПГ может увеличивать долю свободного тестостерона. На показатель влияют вес, обмен углеводов и гормональный статус.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Высокий ГСПГ может снижать доступную долю тестостерона. Оценивайте вместе с общим и свободным тестостероном.",
      },
      {
        id: "hematocrit",
        name: "Гематокрит",
        unit: "%",
        min: 40,
        max: 54,
        step: "0.1",
        placeholder: "46",
        low: "Низкий гематокрит может быть связан с анемией или другими состояниями. Сопоставьте с гемоглобином, ферритином и общим анализом крови.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный гематокрит увеличивает вязкость крови. Это особенно важно контролировать при использовании экзогенного тестостерона; значение 56% и выше — повод не откладывать очную оценку состояния.",
      },
    ],
  },
  {
    title: "Щитовидная железа",
    description: "Маркеры обмена веществ, энергии и восстановления",
    markers: [
      {
        id: "tsh",
        name: "ТТГ",
        unit: "мМЕ/л",
        min: 0.4,
        max: 4,
        step: "0.01",
        placeholder: "2.1",
        low: "Сниженный ТТГ оценивают вместе со свободными Т3 и Т4, симптомами и принимаемыми препаратами.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный ТТГ может указывать на снижение функции щитовидной железы. Нужна совместная оценка со свободным Т4.",
      },
      {
        id: "ft3",
        name: "Т3 свободный",
        unit: "пмоль/л",
        min: 2.6,
        max: 5.7,
        step: "0.1",
        placeholder: "4.2",
        low: "Сниженный свободный Т3 оценивают вместе с ТТГ, свободным Т4, питанием и текущими заболеваниями.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный свободный Т3 требует оценки вместе с ТТГ и свободным Т4.",
      },
      {
        id: "ft4",
        name: "Т4 свободный",
        unit: "пмоль/л",
        min: 9,
        max: 19,
        step: "0.1",
        placeholder: "14.0",
        low: "Сниженный свободный Т4 важен в сочетании с ТТГ и симптомами. Оценивайте эти показатели вместе, а не по отдельности.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный свободный Т4 оценивают вместе с ТТГ, симптомами и принимаемыми препаратами.",
      },
    ],
  },
  {
    title: "Липидный профиль",
    description: "Косвенная оценка сердечно-сосудистого риска",
    markers: [
      {
        id: "ldl",
        name: "ЛПНП",
        unit: "ммоль/л",
        max: 3,
        step: "0.01",
        placeholder: "2.3",
        low: "Низкое значение само по себе обычно не является целью отдельной коррекции.",
        normal: "Показатель не превышает общий ориентир. Индивидуальная цель зависит от общего сердечно-сосудистого риска.",
        high: "ЛПНП выше общего ориентира. Индивидуальная цель зависит от давления, курения, диабета, наследственности и других факторов риска.",
      },
      {
        id: "hdl",
        name: "ЛПВП",
        unit: "ммоль/л",
        min: 1,
        max: 2.5,
        step: "0.01",
        placeholder: "1.4",
        low: "Низкий ЛПВП оценивают в составе полного липидного профиля и общего сердечно-сосудистого риска.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Высокий ЛПВП обычно оценивают в контексте полного липидного профиля; сам по себе он не отменяет другие риски.",
      },
      {
        id: "triglycerides",
        name: "Триглицериды",
        unit: "ммоль/л",
        max: 1.7,
        step: "0.01",
        placeholder: "1.2",
        low: "Низкое значение чаще оценивают в контексте питания и общего состояния.",
        normal: "Показатель не превышает общий ориентир.",
        high: "Повышение может быть связано с питанием, алкоголем, лишним весом и нарушениями углеводного обмена.",
      },
    ],
  },
  {
    title: "Общий анализ и запасы железа",
    description: "Кроветворение, транспорт кислорода и восстановление",
    markers: [
      {
        id: "hemoglobin",
        name: "Гемоглобин",
        unit: "г/л",
        min: 130,
        max: 170,
        step: "1",
        placeholder: "150",
        low: "Низкий гемоглобин может указывать на анемию. Важны общий анализ крови, ферритин и поиск причины.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышенный гемоглобин оценивают вместе с гематокритом, условиями проживания, курением и гидратацией.",
      },
      {
        id: "iron",
        name: "Железо",
        unit: "мкмоль/л",
        min: 11.6,
        max: 31.3,
        step: "0.1",
        placeholder: "18.0",
        low: "Сывороточное железо меняется в течение дня. Для оценки дефицита важнее сопоставить его с ферритином и другими показателями обмена железа.",
        normal: "Показатель находится в усреднённом диапазоне.",
        high: "Повышение требует оценки с ферритином, насыщением трансферрина и учётом приёма добавок.",
      },
      {
        id: "ferritin",
        name: "Ферритин",
        unit: "нг/мл",
        min: 30,
        max: 400,
        step: "1",
        placeholder: "120",
        low: "Низкий ферритин может отражать истощение запасов железа даже при нормальном гемоглобине. Важно выяснить причину.",
        normal: "Показатель находится в широком усреднённом диапазоне. Интерпретация зависит от симптомов и признаков воспаления.",
        high: "Ферритин может повышаться при воспалении, болезнях печени или избытке железа. Один показатель не определяет причину.",
      },
    ],
  },
  {
    title: "Простата",
    description: "Скрининговый маркер, зависящий от возраста и контекста",
    markers: [
      {
        id: "psa",
        name: "ПСА общий",
        unit: "нг/мл",
        max: 4,
        step: "0.01",
        placeholder: "1.2",
        low: "Значение ниже порога.",
        normal: "Показатель не превышает общий ориентир. Возраст, динамика и клинический контекст важнее одной цифры.",
        high: "Повышение ПСА не означает диагноз, но требует обсуждения с урологом. На результат могут влиять воспаление и недавнее механическое воздействие.",
      },
    ],
  },
];

const allMarkers = groups.flatMap((group) => group.markers);

function reference(marker: Marker) {
  if (marker.min !== undefined && marker.max !== undefined) {
    return `${marker.min}–${marker.max}`;
  }
  if (marker.max !== undefined) return `до ${marker.max}`;
  return `от ${marker.min}`;
}

function markerStatus(marker: Marker, value: number): Status {
  if (marker.min !== undefined && value < marker.min) return "low";
  if (marker.max !== undefined && value > marker.max) return "high";
  return "normal";
}

function statusLabel(status: Status) {
  if (status === "low") return "↓ Ниже";
  if (status === "high") return "↑ Выше";
  return "В норме";
}

function markerNoun(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "маркеров";
  if (last === 1) return "маркер";
  if (last >= 2 && last <= 4) return "маркера";
  return "маркеров";
}

export default function Home() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [age, setAge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const entered = useMemo(
    () =>
      allMarkers
        .filter((marker) => values[marker.id] !== undefined && values[marker.id] !== "")
        .map((marker) => {
          const value = Number(values[marker.id]);
          return { marker, value, status: markerStatus(marker, value) };
        }),
    [values],
  );

  const deviations = entered.filter((result) => result.status !== "normal");

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entered.length < 3) {
      setError("Заполните минимум 3 показателя, чтобы получить разбор.");
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function reset() {
    setValues({});
    setAge("");
    setSubmitted(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const headline =
    deviations.length === 0
      ? "Все введённые маркеры в диапазоне"
      : deviations.length === 1
        ? "Есть отклонение — обратите внимание"
        : "Несколько отклонений — разберите общую картину";

  const hematocritIsHigh = entered.some(
    ({ marker, status }) => marker.id === "hematocrit" && status === "high",
  );

  return (
    <main>
      <nav className="nav">
        <a className="nav__brand" href="#top" aria-label="В начало страницы">
          ИЛЬЯ <em>ЯРОШЕВИЧ</em>
        </a>
        <div className="nav__links">
          <a href="#system">Система</a>
          <a href="#pharma">Курс / ГЗТ</a>
          <a href="#calculator">Калькулятор</a>
          <a href="#coaching">Ведение</a>
        </div>
        <a className="nav__contact" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          Написать →
        </a>
      </nav>

      <header className="hero" id="top">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Личное сопровождение · мужчины 30–50+</p>
            <h1>
              Верни энергию,
              <span>сон и либидо</span>
              без хаоса
            </h1>
            <p className="hero__lead">
              Помогаю мужчинам 30–50+ снова почувствовать силу, уверенность и
              контроль над телом — через тренировки, питание, восстановление и
              их собственные анализы. Шаг за шагом.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#calculator">
                Проверить анализы бесплатно
              </a>
              <a className="button button--ghost" href="#system">
                Как проходит сопровождение
              </a>
            </div>
            <p className="hero__note">
              Если фармакология тебе не нужна — скажу прямо. Если ты уже на
              курсе или ГЗТ — выстроим тренировки, питание, восстановление и
              контроль показателей вокруг твоего протокола.
            </p>
          </div>
          <figure className="hero__visual">
            <img
              src="https://yaro-gym.ru/hero.jpg"
              alt="Илья Ярошевич — МСМК по жиму лёжа"
            />
            <figcaption>
              <strong>Илья Ярошевич</strong>
              <span>МСМК · онлайн-тренер</span>
            </figcaption>
          </figure>
        </div>
      </header>

      <section className="ticker" aria-label="Ключевые факты">
        <div>
          <span>МСМК · ЖИМ ЛЁЖА</span>
          <span>210 КГ НА ПОМОСТЕ</span>
          <span>12+ ЛЕТ В ТРЕНИРОВКАХ</span>
          <span>МУЖЧИНЫ 30–50+</span>
          <span>ЭНЕРГИЯ · СОН · ЛИБИДО</span>
          <span>ФОРМА БЕЗ ХАОСА</span>
        </div>
      </section>

      <section className="proof-strip wrap">
        <article>
          <strong>30–50+</strong>
          <p>фокус на мужчинах, которым важны энергия, форма и качество жизни</p>
        </article>
        <article>
          <strong>МСМК</strong>
          <p>подтверждённый спортивный результат и 210 кг на помосте</p>
        </article>
        <article>
          <strong>12+ лет</strong>
          <p>практики в тренировках, питании, восстановлении и периодизации</p>
        </article>
        <article>
          <strong>Лично</strong>
          <p>разбираю отчёты, технику и динамику без ассистентов и шаблонов</p>
        </article>
      </section>

      <section className="timeline section">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Путь клиента</p>
              <h2>
                Что меняется
                <em> и когда</em>
              </h2>
            </div>
            <p>
              Не обещаю чудес за неделю. Сначала связываем самочувствие,
              нагрузку, питание, сон и показатели — затем меняем только то, что
              действительно мешает.
            </p>
          </div>
          <div className="timeline__track">
            <article>
              <span>ПЕРВЫЕ 14 ДНЕЙ</span>
              <strong>Появляется понятная картина</strong>
              <p>
                Разбираем исходную точку, анализы, режим и прошлый опыт. На
                руках — рабочий план вместо набора противоречивых советов.
              </p>
            </article>
            <article>
              <span>ПЕРВЫЙ МЕСЯЦ</span>
              <strong>Возвращаются первые ощущения</strong>
              <p>
                По опыту клиентов раньше всего меняются энергия, качество сна,
                желание тренироваться и ощущение контроля над собой.
              </p>
            </article>
            <article>
              <span>ОКОЛО 3 МЕСЯЦЕВ</span>
              <strong>Форма и уверенность закрепляются</strong>
              <p>
                Режим становится устойчивым, тело заметно меняется, а цифры в
                анализах перестают быть непонятным набором значений.
              </p>
            </article>
          </div>
          <p className="timeline__note">
            Срок и скорость изменений индивидуальны: они зависят от исходной
            точки, состояния здоровья и соблюдения плана.
          </p>
        </div>
      </section>

      <section className="pain section wrap">
        <div className="section-heading">
          <p className="eyebrow">С чем ты приходишь</p>
          <h2>
            Ты вроде стараешься.
            <em> Но себя не узнаёшь.</em>
          </h2>
        </div>
        <div className="pain__grid">
          <ul>
            <li>Энергии не хватает даже на обычные дела после работы</li>
            <li>Раньше тянуло в зал, теперь каждая тренировка через силу</li>
            <li>Сон поверхностный, утром просыпаешься уже уставшим</li>
            <li>Снизилось либидо, появилась неуверенность в себе</li>
            <li>Сдал анализы, но не понимаешь, как связать их с самочувствием</li>
          </ul>
          <div className="pain__statement">
            <span>ТЫ НЕ «ПРОСТО ПОСТАРЕЛ»</span>
            <p>
              Между цифрами в бланке и твоей реальной жизнью часто остаётся
              пропасть. Моя задача — собрать режим, тренировки, питание,
              восстановление и контроль в один понятный процесс.
            </p>
          </div>
        </div>
      </section>

      <section className="why section">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">Почему раньше не получалось</p>
            <h2>
              Тебя корректировали
              <em> по отдельным кускам</em>
            </h2>
          </div>
          <div className="why__grid">
            <article>
              <span>01</span>
              <h3>Получил совет за одну встречу</h3>
              <p>
                Разбор закончился, а что делать с режимом, нагрузкой и новыми
                результатами анализов дальше — осталось непонятно.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Повторил чужую схему</h3>
              <p>
                Друг, тренер или блогер рассказывал, что помогло ему, но не видел
                твоих анализов, симптомов и исходной точки.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Собирал советы по чатам</h3>
              <p>
                Один советовал больше тренироваться, другой — купить добавки,
                третий — менять гормоны. Общей картины так и не появилось.
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>Шёл без контрольных точек</h3>
              <p>
                Протокол оставался прежним, хотя менялись самочувствие, вес,
                тренировки и показатели. Без контроля это снова гадание.
              </p>
            </article>
          </div>
          <div className="manifesto">
            <p className="eyebrow">Против чего я</p>
            <div>
              <strong>Против курсов «как у меня» без твоих анализов.</strong>
              <strong>Против горы препаратов до выстроенной базы.</strong>
              <strong>Против молчания о восстановлении и рисках.</strong>
              <strong>Против изменений «на глаз» без контрольных точек.</strong>
            </div>
            <p>
              Здоровье — не расходный материал. Фармакология не замалчивается,
              но и не подменяет сон, питание, тренировочный план и регулярный
              контроль показателей.
            </p>
          </div>
        </div>
      </section>

      <section className="system section" id="system">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Механизм</p>
              <h2>
                Не угадываем.
                <em> Проверяем.</em>
              </h2>
            </div>
            <p>
              Это личное сопровождение, а не разовый файл. Неделя за неделей
              соединяем самочувствие, анализы, нагрузку и образ жизни в одну
              управляемую систему.
            </p>
          </div>
          <div className="system__cards">
            <article>
              <span>01</span>
              <h3>Исходная картина</h3>
              <p>
                Симптомы, сон, стресс, график, питание, тренировки, текущий
                протокол и доступные результаты анализов.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>База под твою жизнь</h3>
              <p>
                План тренировок, питание и восстановление под реальный график —
                без режима, который работает только в отпуске.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Контрольные точки</h3>
              <p>
                Еженедельный отчёт, техника, самочувствие и динамика. На нужных
                этапах — повторные анализы и корректировка общего плана.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pharma section" id="pharma">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Сопровождение курса / ГЗТ</p>
              <h2>
                Контроль.
                <em> Без хаоса.</em>
              </h2>
            </div>
            <p>
              Сопровождаю курс и ГЗТ как часть общей системы: анализы,
              самочувствие, давление, тренировки, питание и восстановление
              должны работать вместе.
            </p>
          </div>
          <div className="pharma__grid">
            <article>
              <span>01</span>
              <h3>Если она не нужна</h3>
              <p>
                Скажу об этом прямо. Сначала проверяем сон, питание, нагрузку,
                лишний вес, стресс и восстановление — причины часто находятся
                именно здесь.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Если ты уже на курсе</h3>
              <p>
                Фиксируем исходную точку, самочувствие, давление, нагрузку и
                лабораторные показатели. Дальше ведём динамику по контрольным
                точкам, а не по ощущениям одного дня.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Если ты на ГЗТ</h3>
              <p>
                Подстраиваю тренировки, питание, кардио и восстановление под
                твой протокол, цель и динамику показателей. Без хаотичных
                изменений от недели к неделе.
              </p>
            </article>
          </div>
          <div className="pharma__boundary">
            <strong>Что входит в сопровождение курса / ГЗТ</strong>
            <p>
              Разбор исходной точки, календарь контрольных анализов, мониторинг
              самочувствия и давления, тренировки, питание, восстановление и
              еженедельная корректировка общего плана.
            </p>
          </div>
        </div>
      </section>

      <section className="client-path section">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Как это проходит</p>
              <h2>
                Четыре шага
                <em> к контролю</em>
              </h2>
            </div>
            <p>
              Твоя задача — выполнять понятный план и раз в неделю присылать
              короткий отчёт. Моя — связать данные и вовремя заметить, где
              требуется изменение.
            </p>
          </div>
          <ol className="client-path__steps">
            <li>
              <span>01</span>
              <div>
                <h3>Анализы и самочувствие</h3>
                <p>
                  Собираем симптомы, режим, текущий протокол, историю
                  тренировок, замеры и результаты лаборатории.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>База с первого дня</h3>
                <p>
                  Получаешь план тренировок, питание, ориентиры по сну и таблицу
                  контроля — без ожидания «идеального понедельника».
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Еженедельная связь</h3>
                <p>
                  Отчёт занимает около пяти минут. Сверяем энергию, сон, либидо,
                  вес, выполнение плана и видео техники.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Контрольные точки</h3>
                <p>
                  Меняем тренировочный и пищевой план по фактам, сверяем
                  самочувствие и показатели с исходной точкой.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="calculator-section section" id="calculator">
        <div className="wrap calculator-intro">
          <div>
            <p className="eyebrow">Бесплатный инструмент</p>
            <h2>
              Проверь 18 маркеров
              <em> за 2 минуты</em>
            </h2>
          </div>
          <p>
            Перенеси значения из лабораторного бланка. Калькулятор покажет,
            какие показатели находятся внутри усреднённого диапазона, а какие
            требуют внимания — особенно в контексте энергии, восстановления и
            безопасной тренировочной нагрузки.
          </p>
        </div>

        <div className="calculator-shell">
          <form onSubmit={calculate}>
            <section className="intro-card">
              <div>
                <p className="section-kicker">01 · Контекст</p>
                <h3>Укажи возраст</h3>
                <p>Опционально — добавим его в итоговый контекст.</p>
              </div>
              <div className="age-grid" role="group" aria-label="Возраст">
                {["30–39", "40–49", "50–59", "60+"].map((item) => (
                  <button
                    className={`age-button ${age === item ? "is-active" : ""}`}
                    key={item}
                    onClick={() => setAge(item)}
                    type="button"
                    aria-pressed={age === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <div className="form-heading">
              <div>
                <p className="section-kicker">02 · Показатели</p>
                <h3>Перенеси данные из анализов</h3>
              </div>
              <span className="form-counter">{entered.length} заполнено</span>
            </div>

            {groups.map((group) => (
              <section className="marker-group" key={group.title}>
                <div className="marker-group__head">
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="marker-list">
                  {group.markers.map((marker) => (
                    <label className="marker-row" key={marker.id} htmlFor={marker.id}>
                      <span className="marker-copy">
                        <strong>{marker.name}</strong>
                        <small>
                          Ориентир: {reference(marker)} {marker.unit}
                        </small>
                      </span>
                      <span className="field-wrap">
                        <input
                          id={marker.id}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step={marker.step}
                          placeholder={marker.placeholder}
                          value={values[marker.id] ?? ""}
                          onChange={(event) => {
                            setValues((current) => ({
                              ...current,
                              [marker.id]: event.target.value,
                            }));
                            setSubmitted(false);
                            setError("");
                          }}
                        />
                        <span>{marker.unit}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <section className="calculate-card">
              <div>
                <p className="section-kicker">03 · Результат</p>
                <h3>Получи расшифровку сразу</h3>
                <p>
                  Заполни хотя бы 3 показателя. То, чего нет в бланке, можно
                  пропустить.
                </p>
              </div>
              <button className="button button--primary calculate-button" type="submit">
                Разобрать мои показатели →
              </button>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </section>
          </form>

          {submitted && (
            <div className="results" ref={resultsRef}>
              <section
                className={`result-summary result-summary--${
                  deviations.length ? "attention" : "ok"
                }`}
              >
                <div className="result-icon" aria-hidden="true">
                  {deviations.length ? "!" : "✓"}
                </div>
                <div>
                  <p className="section-kicker">Разбор готов</p>
                  <h3>{headline}</h3>
                  <p>
                    {deviations.length} из {entered.length} маркеров вне
                    указанного диапазона{age ? ` · возраст: ${age}` : ""}.
                  </p>
                </div>
              </section>

              <section className="results-card">
                <div className="results-card__head">
                  <div>
                    <p className="section-kicker">Детальный разбор</p>
                    <h3>Что означает каждый показатель</h3>
                  </div>
                  <span>
                    {entered.length} {markerNoun(entered.length)}
                  </span>
                </div>
                <div className="result-list">
                  {entered.map(({ marker, value, status }) => (
                    <article className="result-row" key={marker.id}>
                      <div className="result-row__top">
                        <div>
                          <h4>{marker.name}</h4>
                          <p>{marker[status]}</p>
                        </div>
                        <span className={`status status--${status}`}>
                          {statusLabel(status)}
                        </span>
                      </div>
                      <div className="result-row__numbers">
                        <strong>
                          {value} <small>{marker.unit}</small>
                        </strong>
                        <span>
                          Ориентир: {reference(marker)} {marker.unit}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="next-card">
                <p className="section-kicker">Следующие шаги</p>
                <h3>Что делать дальше</h3>
                <ol className="steps">
                  {hematocritIsHigh && (
                    <li>
                      <span>1</span>
                      <p>
                        <strong>Обрати внимание на гематокрит.</strong> Не
                        пытайся самостоятельно «сбивать» показатель. При 56% и
                        выше или при плохом самочувствии не откладывай очную
                        оценку состояния.
                      </p>
                    </li>
                  )}
                  <li>
                    <span>{hematocritIsHigh ? "2" : "1"}</span>
                    <p>
                      <strong>Сверь референсы.</strong> Диапазоны отличаются
                      между лабораториями и методами. Приоритет имеет твой
                      лабораторный бланк.
                    </p>
                  </li>
                  <li>
                    <span>{hematocritIsHigh ? "3" : "2"}</span>
                    <p>
                      <strong>Учитывай условия сдачи.</strong> Сон, стресс,
                      время суток и тяжёлая тренировка накануне могут влиять на
                      результат.
                    </p>
                  </li>
                  <li>
                    <span>{hematocritIsHigh ? "4" : "3"}</span>
                    <p>
                      <strong>Смотри на систему.</strong> Оценивай показатели
                      вместе с самочувствием, тренировочной нагрузкой, питанием,
                      восстановлением и текущим протоколом.
                    </p>
                  </li>
                </ol>
              </section>

              <section className="telegram-card">
                <div>
                  <p className="section-kicker">Следующий шаг</p>
                  <h3>Покажи результат Илье</h3>
                  <p>
                    Свяжем показатели с энергией, сном, либидо, нагрузкой и
                    режимом. Если ты уже на курсе или ГЗТ — учтём протокол,
                    нагрузку и контрольные показатели в единой системе.
                  </p>
                </div>
                <a
                  className="button button--telegram"
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Отправить результат в Telegram →
                </a>
              </section>

              <button className="reset-button" type="button" onClick={reset}>
                Очистить и начать заново
              </button>

            </div>
          )}
        </div>
      </section>

      <section className="transformations section">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Результаты подопечных</p>
              <h2>
                Не обещания.
                <em> Измеримые изменения.</em>
              </h2>
            </div>
            <p>
              Мужчины приходят не только за цифрой на весах. Важно снова
              чувствовать силу, держать режим и видеть, что тело отвечает на
              приложенные усилия.
            </p>
          </div>
          <div className="transformations__grid">
            <article>
              <div className="before-after">
                <figure>
                  <img src="https://yaro-gym.ru/ba_m_before1.jpg" alt="Мужчина до ведения" />
                  <figcaption>ДО · 84 КГ</figcaption>
                </figure>
                <figure>
                  <img src="https://yaro-gym.ru/ba_m_after1.jpg" alt="Мужчина после ведения" />
                  <figcaption>ПОСЛЕ · 78 КГ</figcaption>
                </figure>
              </div>
              <h3>−6 кг за 2 месяца</h3>
              <p>Ушёл живот, появился рельеф, силовые тренировки сохранены.</p>
            </article>
            <article>
              <div className="before-after">
                <figure>
                  <img src="https://yaro-gym.ru/ba_m_before2.jpg" alt="Мужчина до ведения" />
                  <figcaption>ДО</figcaption>
                </figure>
                <figure>
                  <img src="https://yaro-gym.ru/ba_m_after2.jpg" alt="Мужчина после ведения" />
                  <figcaption>ПОСЛЕ</figcaption>
                </figure>
              </div>
              <h3>Система вместо постоянных рывков</h3>
              <p>Питание, силовые и восстановление собраны в выполнимый режим.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about section wrap">
        <div className="about__images" aria-label="Путь Ильи">
          <figure>
            <img src="https://yaro-gym.ru/ba_gen1.jpg" alt="Илья в начале пути, 50 кг" />
            <figcaption>50 КГ · СТАРТ</figcaption>
          </figure>
          <figure>
            <img src="https://yaro-gym.ru/ba_gen3.jpg" alt="Илья в форме, 93 кг" />
            <figcaption>93 КГ · СИСТЕМА</figcaption>
          </figure>
        </div>
        <div className="about__copy">
          <p className="eyebrow">Кто я</p>
          <h2>
            Я знаю цену
            <em> системе</em>
          </h2>
          <p>
            Начинал с 50 кг и тренировок без системы. Прошёл набор, ошибки в
            питании, плато и подготовку к соревнованиям — до 93 кг рабочей формы
            и звания МСМК.
          </p>
          <p>
            Моя компетенция — соединить тренировочный процесс, питание,
            восстановление, анализы и самочувствие в одну управляемую систему,
            которая работает в реальной жизни — с работой, семьёй и
            командировками.
          </p>
          <blockquote>
            Генетика влияет на потолок. Система решает, приблизишься ли ты к
            нему вообще.
          </blockquote>
        </div>
      </section>

      <section className="work-format section">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Формат</p>
              <h2>
                Как устроена
                <em> работа</em>
              </h2>
            </div>
            <p>
              Ты не остаёшься один с новой цифрой в анализах или плохой
              неделей. Есть понятный ритм работы и следующий шаг.
            </p>
          </div>
          <div className="work-format__grid">
            <article>
              <span>СВЯЗЬ</span>
              <h3>Общаемся в Telegram</h3>
              <p>
                Вопросы по тренировкам, питанию, сну, самочувствию и изменениям
                графика не копятся до конца месяца.
              </p>
            </article>
            <article>
              <span>РАЗ В НЕДЕЛЮ</span>
              <h3>Короткий отчёт</h3>
              <p>
                Энергия, сон, либидо, вес, замеры и выполнение плана. Заполнение
                занимает около пяти минут.
              </p>
            </article>
            <article>
              <span>НА КОНТРОЛЬНЫХ ТОЧКАХ</span>
              <h3>Сверяем показатели</h3>
              <p>
                Смотрим динамику анализов, давления и самочувствия. Сверяем
                изменения с исходной точкой и текущим планом.
              </p>
            </article>
            <article>
              <span>ПО ФАКТУ</span>
              <h3>Корректируем базу</h3>
              <p>
                Меняем объём и интенсивность тренировок, питание,
                восстановление и точки контроля показателей.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="coaching section" id="coaching">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">Личное онлайн-ведение</p>
            <h2>
              От усталости
              <em> к контролю над собой</em>
            </h2>
          </div>
          <div className="coaching__layout">
            <ol className="coaching__steps">
              <li>
                <span>01</span>
                <div>
                  <h3>Анкета и цель в цифрах</h3>
                  <p>
                    Энергия, сон, либидо, здоровье, график, опыт и ограничения.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Разбор исходной картины</h3>
                  <p>
                    Анализы, образ жизни и текущий протокол — без попытки
                    объяснить всё одним показателем.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Тренировки и питание</h3>
                  <p>
                    Рабочий план под твою жизнь, технику, восстановление и цель.
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <h3>Контроль каждую неделю</h3>
                  <p>
                    Меняем тренировки, питание и восстановление по факту, а не
                    по шаблону.
                  </p>
                </div>
              </li>
            </ol>
            <aside className="offer-card">
              <p className="eyebrow">Максимальный формат</p>
              <h3>Мужское сопровождение 30–50+</h3>
              <p>
                Для тех, кто хочет вернуть энергию, сон, либидо, уверенность и
                форму — без чужих схем и одиночного поиска ответов.
              </p>
              <ul>
                <li>стартовая анкета и разбор образа жизни</li>
                <li>информационный разбор доступных анализов</li>
                <li>индивидуальные тренировки и питание</li>
                <li>обратная связь и контроль техники в Telegram</li>
                <li>еженедельная корректировка нагрузки и режима</li>
                <li>сопровождение курса / ГЗТ по контрольным точкам</li>
              </ul>
              <div className="offer-card__price">
                <strong>80 000 ₸</strong>
                <span>/ месяц</span>
              </div>
              <p className="offer-card__compare">
                Это не разовая расшифровка и не готовый файл. Я нахожусь внутри
                процесса, вижу динамику и связываю тренировки, режим, анализы и
                текущий протокол в одну систему.
              </p>
              <a className="button button--primary" href={COACHING_URL} target="_blank" rel="noreferrer">
                Обсудить ведение →
              </a>
              <small>
                Количество мест ограничено: каждого клиента веду лично.
              </small>
            </aside>
          </div>
        </div>
      </section>

      <section className="formats section">
        <div className="wrap">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Форматы работы</p>
              <h2>
                Выбери свой
                <em> первый шаг</em>
              </h2>
            </div>
            <p>
              Не каждому нужен одинаковый формат. Сначала определяем, требуется
              ли полное ведение, сопровождение курса / ГЗТ или самостоятельная
              программа.
            </p>
          </div>
          <div className="formats__grid">
            <article className="format-card format-card--main">
              <span>ФЛАГМАН</span>
              <h3>Личное онлайн-ведение</h3>
              <p>
                Энергия, сон, форма и уверенность: анализы, тренировки, питание,
                восстановление и еженедельный контроль.
              </p>
              <strong>80 000 ₸ / месяц</strong>
              <a className="button button--primary" href={COACHING_URL} target="_blank" rel="noreferrer">
                Обсудить формат →
              </a>
            </article>
            <article className="format-card">
              <span>КУРС / ГЗТ</span>
              <h3>Сопровождение курса / ГЗТ</h3>
              <p>
                Анализы, самочувствие, давление, нагрузка, питание и
                восстановление собраны вокруг твоего протокола.
              </p>
              <strong>Формат — после разбора ситуации</strong>
              <a className="button button--ghost" href={COACHING_URL} target="_blank" rel="noreferrer">
                Описать ситуацию →
              </a>
            </article>
            <article className="format-card">
              <span>ДЛЯ САМОСТОЯТЕЛЬНЫХ</span>
              <h3>Готовые программы</h3>
              <p>
                Жиросжигание, набор массы или «Жим 100» — для тех, кому нужен
                понятный план без личного сопровождения.
              </p>
              <strong>от 1 099 ₽ разово</strong>
              <a className="button button--ghost" href="https://yaro-gym.ru/#programs" target="_blank" rel="noreferrer">
                Посмотреть программы →
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="faq section wrap">
        <div className="section-heading">
          <p className="eyebrow">Вопросы</p>
          <h2>
            Что обычно
            <em> спрашивают</em>
          </h2>
        </div>
        <div className="faq__list">
          <details>
            <summary>Можно прийти на сопровождение курса или ГЗТ?</summary>
            <p>
              Да. Разбираем исходную точку и текущий протокол, выстраиваем
              контроль показателей, тренировки, питание и восстановление.
              Дальше каждую неделю смотрим динамику и корректируем общий план.
            </p>
          </details>
          <details>
            <summary>Мне будут навязывать фармакологию?</summary>
            <p>
              Нет. Если по исходной картине фармакология не нужна, я не
              превращаю её в «обязательный следующий шаг». Сон,
              питание, лишний вес, стресс и тренировочная нагрузка часто дают
              больше работы, чем кажется.
            </p>
          </details>
          <details>
            <summary>А если я уже использую фармакологию?</summary>
            <p>
              Можно прийти и с этим запросом. Без морализаторства: фиксируем
              исходную точку, учитываем текущий протокол в тренировках и
              питании, следим за самочувствием, давлением и анализами.
            </p>
          </details>
          <details>
            <summary>«Химия» — это вред. Зачем вообще о ней говорить?</summary>
            <p>
              Потому что молчание не делает риски меньше. Если тема уже есть в
              жизни человека, её нужно учитывать и контролировать показатели.
              При этом база — тренировки, питание, сон и восстановление —
              остаётся первой.
            </p>
          </details>
          <details>
            <summary>Нужно сдавать все 18 показателей?</summary>
            <p>
              Для калькулятора достаточно трёх значений. Если какого-то
              показателя нет, его можно пропустить. Калькулятор покажет общую
              картину только по тем данным, которые ты введёшь.
            </p>
          </details>
          <details>
            <summary>Почему 80 000 ₸ — это не просто цена программы?</summary>
            <p>
              Программа — это стартовый документ. В ведении я каждую неделю
              разбираю отчёт, видео техники, сон, самочувствие и динамику,
              отвечаю на вопросы и меняю план. Ты платишь за управление
              процессом, а не за один файл.
            </p>
          </details>
          <details>
            <summary>Я уже пробовал курс или работал с тренером — не помогло</summary>
            <p>
              Начинаем не с повторения прошлого, а с разбора, почему оно не
              сработало: чужая схема, отсутствие контроля, неподходящая
              нагрузка, слабая база или недостающие данные. Затем строим новый
              маршрут по твоим данным.
            </p>
          </details>
          <details>
            <summary>Подойдёт ли ведение новичку или очень занятому человеку?</summary>
            <p>
              Да. Нагрузка строится от текущего уровня и реального графика. План
              можно адаптировать под командировки, домашние тренировки и
              ограниченное время — тебе не нужно сначала стать «идеальным
              клиентом».
            </p>
          </details>
          <details>
            <summary>Нужно тренироваться пять–шесть раз в неделю и жить на диете?</summary>
            <p>
              Нет. Частота и питание зависят от цели, стажа, графика и
              восстановления. Система должна выдерживать работу, семью и
              обычную жизнь, иначе она развалится после первой сложной недели.
            </p>
          </details>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <p className="eyebrow">Первый шаг — по твоим данным</p>
          <h2>
            Готов вернуть энергию,
            <em> сон и либидо?</em>
          </h2>
          <p>
            Проверь показатели бесплатно, а затем напиши мне в Telegram.
            Свяжем анализы, самочувствие, тренировки, питание и текущий протокол
            в один понятный план.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#calculator">
              Открыть калькулятор
            </a>
            <a className="button button--ghost" href={COACHING_URL} target="_blank" rel="noreferrer">
              Обсудить сопровождение
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer__brand">
          <strong>ИЛЬЯ <em>ЯРОШЕВИЧ</em></strong>
          <span>Мужчины 30–50+ · онлайн-тренер · МСМК</span>
        </div>
        <div className="footer__links">
          <a href="https://yaro-gym.ru/" target="_blank" rel="noreferrer">Основной сайт</a>
          <a href="https://t.me/ilya_yaroshevich" target="_blank" rel="noreferrer">Telegram</a>
        </div>
        <p>
          Сопровождение - информационная и организационная поддержка. Не является
          медицинской услугой и не заменяет консультацию врача: решения о приёме
          любых препаратов принимаются вместе с врачом. Скорость и глубина
          изменений индивидуальны и зависят от исходных показателей, состояния
          здоровья и соблюдения плана. 18+
        </p>
      </footer>
    </main>
  );
}
