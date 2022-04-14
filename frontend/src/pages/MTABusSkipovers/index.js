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

    const renderData = () => {
        return <div>
            {data.map(entry => {
                let rand = getRandomIntInclusive(0,1);
                return <div className={styles.entry}>
                    <div className={`${styles.busEntry} ${entry['highlight']===0?styles.highlight:''}`}>
                        <span className={styles.auxtext}>bus 1:</span>
                        {entry.bus1}
                    </div>
                    <div className={`${styles.busEntry}`}>
                        <span className={styles.auxtext}>distance:</span>
                        {`${entry.distance} mi`}</div>
                    <div className={`${styles.busEntry} ${entry['highlight']===1?styles.highlight:''}`}>
                        <span className={styles.auxtext}>bus 2:</span>
                        {entry.bus2}
                    </div>
                    {/*{` and ${entry.bus2} are running at a distance of ${entry.distance} miles on the same route.`}*/}
                </div>
            })}
        </div>
    }

    return (
        <div>
            <h1 className={styles.heading}>MTA Buses Which Are Running Too Close</h1>
            <h3 className={styles.description}>
                Each Row Contains MTA Bus IDs of busses on the same route and direction which are running very close and the distance between them.
                If they are too close then one of them may skip the next bus stop if no passenger wants to get off.
                The bus ID which is being highlighted is the one closer to next bus stop and will be sent a signal.
                If the bus driver sees this signal and there is no passenger getting off, he will skip the next stop.
                This will save a lot of city's resources in the long run and contribute to reduction of traffic congestion.
                <br/><br/>This data updates every 30 seconds on average.
            </h3>
            {data == null ? renderLoader():renderData()}
        </div>
    );
};

export default MTABusSkipovers;