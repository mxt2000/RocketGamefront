import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { useAtom } from "jotai";
import StatInfo from "../atom/stat-info";
import { realGameState, userData } from "../../store";
import { REACT_APP_SERVER } from "../../utils/privateData";


const StatList = () => {
  const [isReal,] = useAtom(realGameState)
  const [user,] = useAtom(userData);
  const serverUrl = REACT_APP_SERVER;
  const [statData, setStatData] = useState([]);
  const realName = user.RealName;
  const userName = user.UserName;

  const convertFormatData = (date) => {
    console.log(date)
    const nowDate = moment.utc();
    console.log( "current monent", moment())
    const selectedDate = moment(date);
    console.log("selectedDate.format('L') ",selectedDate.format('L'))
    const diffDate = nowDate.diff(selectedDate,'days');
    console.log("now: ",nowDate)
    console.log("selectedDate ",selectedDate)
    console.log("diffDate ",diffDate)
    if (diffDate === 0) return "Today";
    if (diffDate === 1) return "Yesterday";
    return selectedDate.format('L');
  }
  useEffect(() => {
    let isMounted = true
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    fetch(`${serverUrl}/game_history`, { method: 'POST', body: JSON.stringify({ historySize: 100, realName: realName, userName: userName }), headers })
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        if (isMounted) {
          try {
            const myData = data.gamesHistory
            const newHistoryGames = isReal ? myData.real.reverse() : myData.virtual.reverse()
            const groupedData = newHistoryGames.reduce((_statsData, current) => {
              if (!_statsData[current.date]) {
                _statsData[current.date] =
                {
                  date: convertFormatData(current.date),
                  data: []
                }
              }
              _statsData[current.date].data.push(
                { bet: current.bet, stop: current.stop === 'x' ? 0 : current.stop }
              )
              return _statsData;
            }, {})
            const convertedData = Object.values(groupedData);
            setStatData(convertedData)

          } catch (e) {
            // eslint-disable-next-line no-self-assign
            document.location.href = document.location.href
          }
        }
      })
    return () => { isMounted = false }

  }, [isReal])


  return (
    <div className="text-[14px] font-medium">
      <div className="flex w-full justify-between text-blueFaded border-b border-white_20 px-4 py-2">
        <div>Bet</div>
        <div>Stop/Crash</div>
        <div>Profit</div>
      </div>
      <div className="overflow-auto" style={{ height: "calc(100vh - 180px)" }}>
        {
          statData.map((_statdata, _index) => (
            <StatInfo data={_statdata} key={_index} />
          ))
        }
      </div>
    </div>
  )
}

export default StatList;