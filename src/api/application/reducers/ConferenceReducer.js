import AbstractReducer from "@/api/application/reducers/AbstractReducer";

export default class ConferenceReducer extends AbstractReducer {

    get sourceConference() {
        return this.propertyValue
    }

    execute() {
        return this.sourceConference?.map(ConferenceReducer.reduceConference);
    }

    static reduceConference(){

    }

}