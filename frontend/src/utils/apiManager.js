import axios from "axios";
import {MTA_SERVERLESS_DATA_ENDPOINT} from "./constants";


const getMtaBusLatest = () => {
    return axios({
        method: 'GET',
        url: MTA_SERVERLESS_DATA_ENDPOINT,
    });
}

export { getMtaBusLatest };