declare module 'react-plotly.js' {
    import * as Plotly from 'plotly.js';
    import * as React from 'react';
    
    interface PlotParams {
        data?: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        frames?: Partial<Plotly.Frame>[];
        config?: Partial<Plotly.Config>;
        onClick?: (event: Plotly.PlotMouseEvent) => void;
        onBeforeHover?: (event: Plotly.PlotMouseEvent) => void;
        onHover?: (event: Plotly.PlotMouseEvent) => void;
        onUnHover?: (event: Plotly.PlotMouseEvent) => void;
        onSelected?: (event: Plotly.PlotSelectionEvent) => void;
        onDeselect?: () => void;
        onDoubleClick?: () => void;
        onRelayout?: (event: Plotly.PlotRelayoutEvent) => void;
        onRestyle?: (event: Plotly.PlotRestyleEvent) => void;
        onRedraw?: () => void;
        onPurge?: () => void;
        onError?: () => void;
        onAfterExport?: () => void;
        onAfterPlot?: () => void;
        onAnimated?: () => void;
        onAnimatingFrame?: (event: { name: string; frame: { data: any[] } }) => void;
        onAnimationInterrupted?: () => void;
        onAutoSize?: () => void;
        onButtonClicked?: (event: Plotly.PlotButtonClickEvent) => void;
        onClickAnnotation?: (event: any) => void;
        onDeselect?: () => void;
        onFramework?: () => void;
        onLegendClick?: (event: Plotly.PlotLegendClickEvent) => void;
        onLegendDoubleClick?: (event: Plotly.PlotLegendClickEvent) => void;
        onSliderChange?: (event: { points: number[]; step: number; interaction: boolean }) => void;
        onSliderEnd?: (event: { points: number[]; step: number }) => void;
        onSliderStart?: (event: { points: number[]; step: number }) => void;
        onTransitioning?: () => void;
        onTransitionInterrupted?: () => void;
        onUpdate?: () => void;
        style?: React.CSSProperties;
        className?: string;
        useResizeHandler?: boolean;
        debug?: boolean;
        divId?: string;
        revision?: number;
    }

    const Plot: React.ComponentType<PlotParams>;
    export default Plot;
}