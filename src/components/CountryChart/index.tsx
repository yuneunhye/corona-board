import * as S from "./style";
import React, { useEffect, useState } from "react";
import {
  OneMonthChartInfo,
  OneCountryInfoResponse,
  ShowingDate,
} from "../../types";

import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);
interface Props {
  countryDailyInfo: Array<OneCountryInfoResponse> | undefined;
}

export default function CountryChart({
  countryDailyInfo,
}: Props): React.ReactElement {
  useEffect(() => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - 1);
    const oneMonthData = countryDailyInfo?.filter(
      (item) => new Date(item.Date) > monthDate
    );

    if (oneMonthData) {
      setMonthChartInfo({
        label: oneMonthData?.map((item) =>
          item.Date.substring(5, item.Date.indexOf("T"))
        ),
        Confirmed: oneMonthData?.map((item) => item.Confirmed),
        Deaths: oneMonthData?.map((item) => item.Deaths),
      });
      const startDate = oneMonthData[0].Date;
      const endDate = oneMonthData[oneMonthData.length - 1].Date;

      setShowingDate({
        startDate: startDate.substring(0, startDate.indexOf("T")),
        endDate: endDate.substring(0, endDate.indexOf("T")),
      });
    }
  }, [countryDailyInfo]);

  const [monthChartInfo, setMonthChartInfo] = useState<OneMonthChartInfo>();

  const [showingDate, setShowingDate] = useState<ShowingDate>();

  const chartData = {
    labels: monthChartInfo?.label,
    datasets: [
      {
        type: "line" as const,
        label: "Confirmed",
        backgroundColor: "red",
        borderColor: "red",
        data: monthChartInfo?.Confirmed,
      },
      {
        type: "line" as const,
        label: "Deaths",
        backgroundColor: "gray",
        borderColor: "gray",
        data: monthChartInfo?.Deaths,
      },
    ],
  };

  return (
    <S.ChartSection>
      {monthChartInfo ? (
        <>
          <S.ChartTitle>선택 국가 차트</S.ChartTitle>
          <S.OneCountryChartWrapper>
            {showingDate && (
              <S.CaptionText>
                {showingDate.startDate} ~ {showingDate.endDate}
              </S.CaptionText>
            )}
            <Chart type="bar" data={chartData} />
          </S.OneCountryChartWrapper>
        </>
      ) : (
        <S.InfoText>
          상단에서 나라를 선택하면 해당 국가의 차트를 볼 수 있습니다.
        </S.InfoText>
      )}
    </S.ChartSection>
  );
}
