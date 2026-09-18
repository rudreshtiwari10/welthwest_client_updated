/**
 * Stage 3 — Risk Management.
 *
 * Three plain-English postures on top of the same risk object the engine has
 * always received. Picking one writes every field; the advanced block below
 * still exposes each of them individually.
 */

import React from 'react';
import { Catalogue } from '../../../../services/backtestIndia';
import { Field, inputCls } from '../../StrategyBuilder';
import { Note } from '../../viz';
import { Info, PresetRow, Section, Toggle } from '../ui';
import { RunSettings, sameAsDefault } from '../config';

/**
 * Each posture is a complete risk object — no partial merges, so switching
 * between them is always reversible.
 */
export const RISK_PRESETS = [
  {
    key: 'conservative',
    label: 'Conservative',
    blurb: 'Cut losses early, bank wins sooner, stop trading in a bad run.',
    risk: {
      stop_type: 'atr', stop_atr_multiple: 1.5,
      target_type: 'r_multiple', target_r: 2.0,
      trailing_enabled: true, trailing_atr_multiple: 2.5,
      breakeven_enabled: true, breakeven_trigger_r: 1.0,
      time_stop_bars: 20, cooldown_bars: 5,
      portfolio_max_drawdown: 0.15, max_consecutive_losses: 4,
    },
  },
  {
    key: 'balanced',
    label: 'Balanced',
    blurb: 'Recommended. Room to breathe, with a trailing stop to protect gains.',
    risk: {
      stop_type: 'atr', stop_atr_multiple: 2.0,
      target_type: 'r_multiple', target_r: 2.5,
      trailing_enabled: true, trailing_atr_multiple: 3.0,
      breakeven_enabled: false, breakeven_trigger_r: 1.0,
      time_stop_bars: 0, cooldown_bars: 3,
      portfolio_max_drawdown: 0, max_consecutive_losses: 0,
    },
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    blurb: 'Wide stops, big targets. Fewer, larger swings in both directions.',
    risk: {
      stop_type: 'atr', stop_atr_multiple: 3.0,
      target_type: 'r_multiple', target_r: 4.0,
      trailing_enabled: true, trailing_atr_multiple: 4.0,
      breakeven_enabled: false, breakeven_trigger_r: 1.0,
      time_stop_bars: 0, cooldown_bars: 0,
      portfolio_max_drawdown: 0, max_consecutive_losses: 0,
    },
  },
];

export const RiskStage: React.FC<{
  catalogue: Catalogue;
  settings: RunSettings;
  set: <K extends keyof RunSettings>(k: K, v: RunSettings[K]) => void;
}> = ({ catalogue, settings, set }) => {
  const risk = settings.risk;
  const setRisk = (k: string, v: any) => set('risk', { ...risk, [k]: v });

  const activePreset = RISK_PRESETS.find((p) => sameAsDefault(p.risk, risk))?.key;

  const stopLabel = risk.stop_type === 'percent' ? 'Stop %' : 'Stop ATR multiple';
  const targetKey =
    risk.target_type === 'percent'
      ? 'target_percent'
      : risk.target_type === 'atr'
      ? 'target_atr_multiple'
      : 'target_r';
  const targetLabel =
    risk.target_type === 'percent'
      ? 'Target %'
      : risk.target_type === 'atr'
      ? 'Target ATR multiple'
      : 'Target R';

  return (
    <>
      <Section
        title="Pick a risk posture"
        hint="This sets your stop loss, profit target, trailing stop and safety halts in one go."
      >
        <PresetRow
          options={RISK_PRESETS}
          activeKey={activePreset}
          onPick={(k) => set('risk', { ...RISK_PRESETS.find((p) => p.key === k)!.risk })}
        />
        {!activePreset && (
          <p className="mt-2.5 text-[11px] text-primary-600 dark:text-primary-400">
            Custom settings — pick a posture above to reset to a known-good starting point.
          </p>
        )}
      </Section>

      <Section
        title="Getting out of a losing trade"
        hint="Where the stop sits. It becomes a resting order checked against every bar, not a rule applied at the close."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Stop type"
            hint="ATR scales the stop to how volatile the instrument currently is."
          >
            <select className={inputCls} value={risk.stop_type} onChange={(e) => setRisk('stop_type', e.target.value)}>
              {catalogue.risk_rules.stop_types.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label={stopLabel}>
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={risk.stop_type === 'percent' ? risk.stop_percent : risk.stop_atr_multiple}
              onChange={(e) =>
                setRisk(risk.stop_type === 'percent' ? 'stop_percent' : 'stop_atr_multiple', Number(e.target.value))
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Getting out of a winning trade"
        hint="Where profit is taken, and whether the exit follows the price up."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Target type">
            <select className={inputCls} value={risk.target_type} onChange={(e) => setRisk('target_type', e.target.value)}>
              {catalogue.risk_rules.target_types.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field
            label={targetLabel}
            hint={risk.target_type === 'r_multiple' ? 'A multiple of what you risked. 2.5R aims to win ₹2.50 for every ₹1 at risk.' : undefined}
          >
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={risk[targetKey]}
              onChange={(e) => setRisk(targetKey, Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="mt-3 space-y-1.5">
          <Toggle
            label="Trailing stop"
            hint={`Follows the highest price since entry, minus ${risk.trailing_atr_multiple}× ATR. It only ever tightens.`}
            checked={!!risk.trailing_enabled}
            onChange={(v) => setRisk('trailing_enabled', v)}
          />
          {risk.trailing_enabled && (
            <div className="ml-12 w-44">
              <Field label="Trail ATR multiple">
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={risk.trailing_atr_multiple}
                  onChange={(e) => setRisk('trailing_atr_multiple', Number(e.target.value))}
                />
              </Field>
            </div>
          )}
          <Toggle
            label="Move stop to breakeven"
            hint={`Once the trade is +${risk.breakeven_trigger_r}R in profit, the stop moves to your entry price so the trade can no longer lose.`}
            checked={!!risk.breakeven_enabled}
            onChange={(v) => setRisk('breakeven_enabled', v)}
          />
        </div>
      </Section>

      <Section
        title="Safety halts"
        hint="Circuit breakers that stop new entries when things go wrong. Set any of them to 0 to disable."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Time stop (bars)" hint="Close a trade that has gone nowhere after this many bars.">
            <input type="number" className={inputCls} value={risk.time_stop_bars} onChange={(e) => setRisk('time_stop_bars', Number(e.target.value))} />
          </Field>
          <Field label="Cooldown (bars)" hint="Blocks re-entry into the same name right after an exit.">
            <input type="number" className={inputCls} value={risk.cooldown_bars} onChange={(e) => setRisk('cooldown_bars', Number(e.target.value))} />
          </Field>
          <Field label="Portfolio drawdown halt" hint="0.25 stops new entries once the account is 25% below its peak.">
            <input type="number" step="0.05" className={inputCls} value={risk.portfolio_max_drawdown} onChange={(e) => setRisk('portfolio_max_drawdown', Number(e.target.value))} />
          </Field>
          <Field label="Halt after N losses" hint="Stops trading after this many losses in a row.">
            <input type="number" className={inputCls} value={risk.max_consecutive_losses} onChange={(e) => setRisk('max_consecutive_losses', Number(e.target.value))} />
          </Field>
        </div>

        <Note>
          Stops and targets are resolved against each bar's actual high and low
          <Info text="If a bar's range touches both your stop and your target, the same-bar policy in Position Sizing decides which one filled first." />
          {' '}— never assumed at the close.
        </Note>
      </Section>
    </>
  );
};
