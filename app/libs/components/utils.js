/**
 * Created by claudio on 26/07/16.
 */


module.exports = {
    indexOfObject(data, ele, key){
        return data.map((value)=>{return value[key]}).indexOf(ele[key]);
    },
    pluck(data, key){
        return data.map((value)=>{return value[key]});
    }
};
