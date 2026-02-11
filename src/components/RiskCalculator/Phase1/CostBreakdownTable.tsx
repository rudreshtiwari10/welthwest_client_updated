import React from 'react';
import { CostDetails } from '../../../services/riskCalculator';

interface CostBreakdownTableProps {
  result: any;
  className?: string;
}

const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
  result,
  className = ''
}) => {
  if (!result?.data?.cost_breakdown) {
    return null;
  }

  const { cost_breakdown, scenario_analysis } = result.data;

  const renderCostRow = (label: string, costs: CostDetails) => (
    <>
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white" colSpan={2}>
          {label}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Buy Value</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.buy_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Sell Value</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.sell_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Total Turnover</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.total_turnover.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Brokerage</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.brokerage.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">STT/CTT</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.stt_ctt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Exchange Transaction Charge</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.exchange_txn_charge.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">SEBI Charges</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.sebi_charges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">Stamp Duty</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.stamp_duty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">GST</td>
        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">
          ₹{costs.gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </td>
      </tr>
      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <td className="py-2 px-4 pl-8 text-sm font-semibold text-gray-900 dark:text-white">Total Cost</td>
        <td className="py-2 px-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
          ₹{costs.total_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            ({costs.cost_percentage.toFixed(2)}%)
          </span>
        </td>
      </tr>
    </>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Detailed Cost Breakdown
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All costs calculated based on {result.data.broker.toUpperCase()} brokerage structure
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {/* Entry Costs */}
            {renderCostRow('Entry Costs', cost_breakdown.estimated_costs_at_entry)}

            {/* Stop Loss Costs */}
            {renderCostRow('Exit at Stop Loss', cost_breakdown.costs_at_stop_loss)}

            {/* Target Costs */}
            {cost_breakdown.costs_at_target && renderCostRow('Exit at Target', cost_breakdown.costs_at_target)}
          </tbody>
        </table>
      </div>

      {/* Scenario Analysis */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Scenario Analysis
        </h3>

        {/* Breakeven Price */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Breakeven Price</span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ₹{scenario_analysis.breakeven_price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Sell above this price to cover all costs
          </p>
        </div>

        {/* At Stop Loss */}
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            If Stop Loss Hits
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-red-700 dark:text-red-300">Gross Loss:</span>
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                -₹{scenario_analysis.at_stop_loss.gross_loss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-700 dark:text-red-300">Total Costs:</span>
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                ₹{scenario_analysis.at_stop_loss.total_costs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-red-300 dark:border-red-700">
              <span className="text-sm font-semibold text-red-800 dark:text-red-200">Net Loss:</span>
              <span className="text-lg font-bold text-red-900 dark:text-red-100">
                -₹{scenario_analysis.at_stop_loss.net_loss_after_costs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mt-2">
            {scenario_analysis.at_stop_loss.message}
          </p>
        </div>

        {/* At Target */}
        {scenario_analysis.at_target && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
              If Target Hits
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-700 dark:text-green-300">Gross Profit:</span>
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  ₹{scenario_analysis.at_target.gross_profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700 dark:text-green-300">Total Costs:</span>
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  ₹{scenario_analysis.at_target.total_costs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700">
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">Net Profit:</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-100">
                  ₹{scenario_analysis.at_target.net_profit_after_costs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              {scenario_analysis.at_target.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostBreakdownTable;
