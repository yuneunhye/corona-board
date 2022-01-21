import React, { useEffect, FC, useState, ReactNode } from "react";
import { getSummaryCovidData, getCountryInfo } from "./api";
import {
  SpecificInfo,
  Country,
  OneCountryInfoResponse,
  OneMonthChartInfo,
} from "./types";
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
import { Title } from "./components";
import * as S from "./style";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);
const App: FC = () => {
  async function initData() {
    const { data } = await getSummaryCovidData();
    /** TODO:
     * 로컬 스토리지에 저장해둔 글로벌 정보가 있으면 해당 정보가 제일 먼저 보이도록,
     * 만약 없으면 Global로 가는 것
     *  */
    setGlobalInfo(data.Global);
    setCountriesInfo(
      data.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed)
    );
  }

  async function getCountryData() {
    if (selectedInfo) {
      const { data } = await getCountryInfo(selectedInfo.CountryCode);
      setCountryDailyInfo(data);
    }
  }

  const [countriesInfo, setCountriesInfo] = useState<Array<Country>>();

  const [globalInfo, setGlobalInfo] = useState<SpecificInfo>({
    NewConfirmed: 0,
    NewDeaths: 0,
    NewRecovered: 0,
    TotalConfirmed: 0,
    TotalDeaths: 0,
    TotalRecovered: 0,
    Date: "",
    CountryCode: "",
  });

  const [selectedInfo, setSelectedInfo] = useState<SpecificInfo>();

  const [rankIdx, setRankIdx] = useState<number>(0);

  const [rankList, setRankList] = useState<Array<ReactNode>>();

  const [countryDailyInfo, setCountryDailyInfo] =
    useState<Array<OneCountryInfoResponse>>();

  const [monthChartInfo, setMonthChartInfo] = useState<OneMonthChartInfo>();

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - 1);
    const oneMonthData = countryDailyInfo?.filter(
      (item) => new Date(item.Date) > monthDate
    );

    oneMonthData &&
      setMonthChartInfo({
        label: oneMonthData?.map((item) =>
          item.Date.substring(0, item.Date.indexOf("T"))
        ),
        Confirmed: oneMonthData?.map((item) => item.Confirmed),
        Deaths: oneMonthData?.map((item) => item.Deaths),
      });
  }, [countryDailyInfo]);

  useEffect(() => {
    makeRankTableRow(rankIdx);
  }, [countriesInfo, rankIdx]);

  useEffect(() => {
    getCountryData();
  }, [selectedInfo]);

  const changeCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const selectedCountry = countriesInfo?.filter(
      (country) => country.CountryCode === value
    )[0];

    if (selectedCountry) {
      setSelectedInfo(selectedCountry);
    }
  };

  const makeRankTableRow = (rankIdx: number) => {
    if (!!!countriesInfo) return;

    const copiedRankList = Array.from(rankList || []);
    for (let idx = rankIdx * 50; idx < rankIdx * 50 + 50; idx++) {
      if (!!!countriesInfo[idx]) break;
      copiedRankList.push(
        <S.RankingTr key={idx}>
          <S.RankingTd>{idx + 1}</S.RankingTd>
          <S.RankingTd>{countriesInfo[idx].Country}</S.RankingTd>
          <S.RankingTd>{countriesInfo[idx].TotalConfirmed}</S.RankingTd>
          <S.RankingTd>{countriesInfo[idx].TotalDeaths}</S.RankingTd>
          <S.RankingTd>{countriesInfo[idx].NewConfirmed}</S.RankingTd>
          <S.RankingTd>{countriesInfo[idx].NewDeaths}</S.RankingTd>
        </S.RankingTr>
      );
    }
    setRankList(copiedRankList);
  };

  const data = {
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

  const config = {
    data: data,
  };

  return (
    <div className="App">
      <Title
        changeCountry={changeCountry}
        countriesInfo={countriesInfo}
        selectedInfo={selectedInfo}
        globalInfo={globalInfo}
      />
      <S.PageWrapper>
        <S.RankingSection>
          <S.RankingTable>
            <thead>
              <S.RankingHeadTr>
                <S.RankingTh>순위</S.RankingTh>
                <S.RankingTh>국가명</S.RankingTh>
                <S.RankingWideTh>총 확진자</S.RankingWideTh>
                <S.RankingWideTh>총 사망자</S.RankingWideTh>
                <S.RankingTh>오늘 확진자</S.RankingTh>
                <S.RankingTh>오늘 사망자</S.RankingTh>
              </S.RankingHeadTr>
            </thead>
            <tbody>{rankList}</tbody>
          </S.RankingTable>
          {rankIdx <= 2 && (
            <S.ShowMoreButton onClick={() => setRankIdx(rankIdx + 1)}>
              더보기
            </S.ShowMoreButton>
          )}
        </S.RankingSection>
        <S.ChartSection>
          {monthChartInfo && (
            <S.OneCountryChartWrapper>
              <Chart type="bar" data={config.data} />
            </S.OneCountryChartWrapper>
          )}
        </S.ChartSection>
      </S.PageWrapper>
    </div>
  );
};

export default App;
