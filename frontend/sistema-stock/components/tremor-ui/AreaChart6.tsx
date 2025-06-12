"use client"

import React from "react"
import { AreaChart } from "@tremor/react"

interface DataItem {
  date: string
  Ingresos: number
}

const data: DataItem[] = [
  //array-start
  {
    date: "May 24",
    Ingresos: 3980,
  },
  {
    date: "Jun 24",
    Ingresos: 4702,
  },
  {
    date: "Jul 24",
    Ingresos: 5990,
  },
  {
    date: "Aug 24",
    Ingresos: 5700,
  },
  {
    date: "Sep 24",
    Ingresos: 4250,
  },
  {
    date: "Oct 24",
    Ingresos: 4182,
  },
  {
    date: "Nov 24",
    Ingresos: 3812,
  },
  {
    date: "Dec 24",
    Ingresos: 4900,
  },
  {
    date: "Jan 25",
    Ingresos: 5200,
  },
  {
    date: "Feb 25",
    Ingresos: 6100,
  },
  {
    date: "Mar 25",
    Ingresos: 5800,
  },
  {
    date: "Apr 25",
    Ingresos: 6300,
  },
  {
    date: "May 25",
    Ingresos: 7000,
  },
  //array-end
]

type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: { value: number }[];
};

function AreaChartCallbackExample() {
  const [datas, setDatas] = React.useState<CustomTooltipProps | null>(null)
  const currencyFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`

  const payload = datas?.payload?.[0]
  const value = payload?.value

  const formattedValue = payload
    ? currencyFormatter(value ?? 0)
    : currencyFormatter(data[data.length - 1].Ingresos)

  return (
    <div className="w-full">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Revenue by month
      </p>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">
        {formattedValue}
      </p>

      <AreaChart
        data={data}
        index="date"
        categories={["Ingresos"]}
        colors={["blue"]}
        showLegend={false}
        showYAxis={false}
        startEndOnly={true}
        className="mt-8 -mb-2 w-full h-48"
      />
    </div>
  )
}

export default AreaChartCallbackExample;
