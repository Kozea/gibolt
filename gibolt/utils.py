from pygal import Line
from pygal.style import Style


def make_indicators_graph(indicators, reports, color):
    """Generate sparktext for all indicators."""
    style = Style(
        background='transparent',
        colors=(color,),
        font_family='googlefont:Hindi',
    )
    charts = []
    for indicator in indicators:
        chart = Line(style=style)
        labels = []
        values = []

        for report in reports:
            labels.append(report.created_at.strftime('%d/%m'))
            for report_indicator in report.indicators:
                if report_indicator.item_id == indicator.item_id:
                    value = report_indicator.value or 0
                    values.append(value)
        labels.reverse()
        values.reverse()

        chart.x_labels = labels
        chart.add('', values)
        charts.append(
            {
                'item_id': indicator.item_id,
                'chart': chart.render_sparkline(
                    width=400, show_x_labels=True, show_y_labels=True
                ).decode('utf-8'),
            }
        )
    return charts
