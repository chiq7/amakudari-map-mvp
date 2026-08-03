"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type RolePreset = {
  id: string;
  label: string;
  detail: string;
  monthlyAdjustment: number;
};

const rolePresets: RolePreset[] = [
  { id: "1", label: "事務次官・外局の長官相当", detail: "第1号区分", monthlyAdjustment: 95_400 },
  { id: "2", label: "局長・審議官相当", detail: "第2号区分", monthlyAdjustment: 78_750 },
  { id: "3", label: "本省重要課長相当", detail: "第3号区分", monthlyAdjustment: 70_400 },
  { id: "4", label: "本省課長・管区の長相当", detail: "第4号区分", monthlyAdjustment: 65_000 },
  { id: "6", label: "本省室長・重要課長相当", detail: "第6号区分", monthlyAdjustment: 54_150 },
  { id: "8", label: "本省補佐・重要補佐相当", detail: "第8号区分", monthlyAdjustment: 32_500 },
  { id: "10", label: "係長相当", detail: "第10号区分", monthlyAdjustment: 21_700 },
];

// 内閣人事局「国家公務員退職手当支給率早見表（平成30年1月1日以降の退職）」
// 25年以上勤務したモデルの支給率（調整率を乗じた後）。
const standardRates: Record<number, number> = {
  25: 33.27075, 26: 34.77735, 27: 36.28395, 28: 37.79055, 29: 39.29715,
  30: 40.80375, 31: 42.31035, 32: 43.81695, 33: 45.32355, 34: 46.83015,
  35: 47.709, 36: 47.709, 37: 47.709, 38: 47.709, 39: 47.709,
  40: 47.709, 41: 47.709, 42: 47.709, 43: 47.709, 44: 47.709, 45: 47.709,
};

const selfInitiatedRates: Record<number, number> = {
  25: 28.0395, 26: 29.3787, 27: 30.7179, 28: 32.0571, 29: 33.3963,
  30: 34.7355, 31: 35.7399, 32: 36.7443, 33: 37.7487, 34: 38.7531,
  35: 39.7575, 36: 40.7619, 37: 41.7663, 38: 42.7707, 39: 43.7751,
  40: 44.7795, 41: 45.7839, 42: 46.7883, 43: 47.709, 44: 47.709, 45: 47.709,
};

const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

export default function RetirementAllowanceEstimator() {
  const [roleId, setRoleId] = useState("2");
  const [monthlySalary, setMonthlySalary] = useState(800_000);
  const [years, setYears] = useState(35);
  const [reason, setReason] = useState<"standard" | "self">("standard");

  const role = rolePresets.find((preset) => preset.id === roleId) ?? rolePresets[1];
  const rate = (reason === "standard" ? standardRates : selfInitiatedRates)[years];
  const result = useMemo(() => {
    const basicAmount = monthlySalary * rate;
    // 上位60月すべてが選択した職責区分だった、という経歴モデル上の仮定。
    const adjustmentAmount = role.monthlyAdjustment * 60;
    return { basicAmount, adjustmentAmount, total: basicAmount + adjustmentAmount };
  }, [monthlySalary, rate, role.monthlyAdjustment]);

  const updateModel = (nextRoleId: string) => {
    setRoleId(nextRoleId);
    trackEvent("retirement_allowance_model_change", { role_model: nextRoleId });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
      <section aria-labelledby="estimator-input-title" className="border border-outline-variant bg-surface-container-lowest p-5 shadow-card md:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <p className="text-xs font-extrabold tracking-[0.14em] text-accent">MODEL INPUT</p>
            <h2 id="estimator-input-title" className="mt-2 text-2xl font-extrabold text-primary">経歴モデルを設定する</h2>
          </div>
          <span className="border border-secondary/30 bg-secondary-fixed px-3 py-1 text-xs font-bold text-secondary">25年以上勤務モデル</span>
        </div>

        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="text-sm font-extrabold text-primary">職責の目安</span>
            <span className="mt-1 block text-xs leading-5 text-on-surface-variant">最も高い職責が続いた上位60月を、下の区分で仮定します。</span>
            <select
              value={roleId}
              onChange={(event) => updateModel(event.target.value)}
              className="mt-3 min-h-12 w-full border border-outline-variant bg-surface px-4 text-sm font-bold text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15"
            >
              {rolePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>{preset.label}（{preset.detail}）</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-extrabold text-primary">退職時の俸給月額（仮定）</span>
            <span className="mt-1 block text-xs leading-5 text-on-surface-variant">手当・賞与・民間での給与は含めません。</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                min="200000"
                max="2000000"
                step="10000"
                value={monthlySalary}
                onChange={(event) => setMonthlySalary(Math.min(2_000_000, Math.max(200_000, Number(event.target.value) || 200_000)))}
                onBlur={() => trackEvent("retirement_allowance_salary_change", { monthly_salary: monthlySalary })}
                className="min-h-12 w-full border border-outline-variant bg-surface px-4 text-lg font-extrabold tabular-nums text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                aria-describedby="monthly-salary-note"
              />
              <span className="shrink-0 text-sm font-bold text-on-surface-variant">円／月</span>
            </div>
            <span id="monthly-salary-note" className="mt-2 block text-xs text-on-surface-variant">20万円〜200万円の範囲で入力できます。</span>
          </label>

          <div>
            <span className="text-sm font-extrabold text-primary">勤続年数</span>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[25, 30, 35, 40, 45].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setYears(value); trackEvent("retirement_allowance_year_change", { years: value }); }}
                  className={`min-h-12 border px-3 text-sm font-extrabold transition ${years === value ? "border-secondary bg-secondary text-white" : "border-outline-variant bg-surface text-primary hover:border-secondary"}`}
                  aria-pressed={years === value}
                >
                  {value}年
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-extrabold text-primary">退職理由のモデル</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["standard", "定年・任期満了等", "25年以上勤続後の定年退職等の支給率"],
                ["self", "自己都合退職", "自己都合退職の支給率"],
              ].map(([value, label, detail]) => (
                <label key={value} className={`cursor-pointer border p-4 transition ${reason === value ? "border-secondary bg-secondary-fixed" : "border-outline-variant bg-surface hover:border-secondary"}`}>
                  <input
                    type="radio"
                    name="retirement-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => { setReason(value as "standard" | "self"); trackEvent("retirement_allowance_reason_change", { reason: value }); }}
                    className="sr-only"
                  />
                  <span className="block text-sm font-extrabold text-primary">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{detail}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <aside aria-live="polite" className="border-t-4 border-primary bg-primary p-5 text-white shadow-soft md:p-7">
        <p className="text-xs font-extrabold tracking-[0.14em] text-secondary-fixed">INSTITUTIONAL MODEL</p>
        <h2 className="mt-2 text-2xl font-extrabold">制度上の概算</h2>
        <p className="mt-3 text-sm leading-6 text-white/75">選択した役職経験モデルと入力条件による試算です。個人の実際の受給額ではありません。</p>

        <div className="mt-7 border-y border-white/15 py-5">
          <p className="text-xs font-bold text-white/60">退職手当のモデル合計</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums md:text-5xl">{yen.format(result.total)}</p>
          <p className="mt-2 text-xs text-white/60">基本額 + 調整額（職責区分の上位60月を仮定）</p>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
            <dt className="text-white/65">基本額</dt><dd className="font-extrabold tabular-nums">{yen.format(result.basicAmount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
            <dt className="text-white/65">調整額</dt><dd className="font-extrabold tabular-nums">{yen.format(result.adjustmentAmount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
            <dt className="text-white/65">支給率</dt><dd className="font-extrabold tabular-nums">{rate.toFixed(4)}月分</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-white/65">役職モデル</dt><dd className="text-right font-extrabold">{role.label}</dd>
          </div>
        </dl>

        <div className="mt-6 border-l-2 border-accent bg-white/5 p-4 text-xs leading-6 text-white/75">
          <strong className="block text-white">この数字で分からないこと</strong>
          個別の勤続歴、俸給改定、早期退職特例、休職・減額歴、実際の職責月数などは反映しません。人物・法人ページの情報から実額を推定するものではありません。
        </div>
      </aside>
    </div>
  );
}
