import styles from './styles.module.css';
import React, {useEffect, useState} from 'react';
import {getMtaBusLatest} from "../../utils/apiManager";
import {RevolvingDot} from "react-loader-spinner";
import {getRandomIntInclusive} from "../../utils";

const MTABusSkipovers = () => {
    const [data,setData] = useState(null);
    useEffect(() => {
        setInterval(() => {
            getMtaBusLatest().then(res => {
                if(res.status === 200){
                    setData(res.data);
                }
            })
        },4000)
    },[]);

    const renderLoader = () => {
      return <div className={styles.loaderContainer}>
          <RevolvingDot color="#00BFFF" height={100} width={100} />
      </div>
    }

    const renderRoute = (routeToDisplay,dirToDisplay) => {
        return <div className={styles.route}>
            Route: {routeToDisplay} ({dirToDisplay === 0?'forward':'reverse'} direction)
        </div>
    }

    const renderData = () => {
        let prevRoute = null, prevDir = null;
        return <div>
            {data.map(entry => {
                let routeToDisplay = null, dirToDisplay = null;
                if(entry.route !== prevRoute && entry.route_dir !== prevDir){
                    routeToDisplay = entry.route;
                    dirToDisplay = entry.route_dir;
                }
                prevRoute = entry.route;
                prevDir = entry.route_dir;

                return <div>
                    {routeToDisplay!=null && dirToDisplay!=null && renderRoute(routeToDisplay,dirToDisplay)}
                    <div className={styles.entry}>
                        <div className={`${styles.busEntry} ${entry['highlight']===0?styles.highlight:''}`}>
                            {entry['highlight']===0 && <div className={styles.canSkip}>Can Skip Next Stop!</div>}
                            <span className={styles.auxtext}>bus 1:</span>
                            {entry.bus1}
                        </div>
                        <div className={`${styles.busEntry}`}>
                            <span className={styles.auxtext}>distance:</span>
                            {`${entry.distance} mi`}</div>
                        <div className={`${styles.busEntry} ${entry['highlight']===1?styles.highlight:''}`}>
                            {entry['highlight']===1 && <div className={styles.canSkip}>Can Skip Next Stop!</div>}
                            <span className={styles.auxtext}>bus 2:</span>
                            {entry.bus2}
                        </div>
                    </div>
                </div>
            })}
        </div>
    }

    const renderLength = () => {
      return <span className={styles.dataLengthSpan}>
           As of now, <span className={styles.busesNumber}>{data.length}</span> buses may skip the next stop. This goes up to <span className={styles.busesNumber}>800</span> during peak hours.
      </span>
    }

    return (
        <div>
            <h1 className={styles.heading}>MTA Buses Which Are Running Too Close</h1>
            <h3 className={styles.description}>
                <ul className={styles.list}>
                    <h2>Methodology</h2>
                    <li>Each Row Contains MTA Bus IDs of buses on the same route and direction which are running very close and the distance between them.</li>
                    <li>The bus ID which is being highlighted in red is the one closer to next bus stop and will be sent a signal.</li>
                    <li>When the bus driver sees this signal and there is no passenger getting off, they may skip the next stop.
                        Or if the bus is empty, it can be rerouted.</li>
                    <h2>Outcomes</h2>
                    <li>This will save a lot of city's resources in the long run and greatly contribute to reduction of traffic congestion.</li>
                    <li>{data && renderLength()}</li>
                    <h2>Caveats</h2>
                    <li>We are ignoring the edge case in which the trailing bus might be full. As per experience, this rarely happens.</li>
                </ul>
                <div className={styles.freq}>This data updates every 30 seconds on average.
                </div>
            </h3>
            {data == null ? renderLoader():renderData()}
        </div>
    );
};

export default MTABusSkipovers;