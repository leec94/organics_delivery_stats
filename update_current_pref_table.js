//  tables
let t_veg = base.getTable('Veggies');
let t_veg_pref = base.getTable('Veggie Preferences');
let t_curr_pref = base.getTable('Current Preferences');

// views
let v_veg = t_veg.getView('Grid view');
let v_veg_pref = t_veg_pref.getView('Grid view');
let v_curr_pref = t_curr_pref.getView('Grid view');

output.text("updating rows...");


let result = await v_veg.selectRecordsAsync();
let each_veg;

let all_curr_vegs = await v_curr_pref.selectRecordsAsync({
    sorts: [
        {field: "Veggies", direction: "desc"},
    ]
});

for (let record of result.records) {
    each_veg = record.getCellValueAsString('Name');
    // create record if it doesn't exist 
    let bool_exists = false;
    for (let record_all_res of all_curr_vegs.records){
        if (each_veg == record_all_res.getCellValueAsString('Veggies')){
            bool_exists = true;
        }
    }
    if (!bool_exists){
        output.text("adding " + each_veg + " to curr_pref table");
        await t_curr_pref.createRecordsAsync([
            {
                fields: {
                'Veggies': [{
                    'id': record.id
                }]
                }
            }
        ]);
    }
}

output.text('updating dates...')

let result_pref = await v_veg_pref.selectRecordsAsync();
for (let record of result_pref.records) {
    let each_veg = record.getCellValue('veg_str');
    let each_date = record.getCellValue('delivery_date_date');

    let result2 = await v_curr_pref.selectRecordsAsync();
    for (let record2 of result2.records) {
        let latest_date = record2.getCellValue('Latest Date');
        let curr_veg = record2.getCellValueAsString('Veggies');

       
        if (curr_veg != each_veg){
            continue;
        }

        if (!latest_date){
            output.text("updating current_veg: " + curr_veg + " to " + each_date );
            await t_curr_pref.updateRecordAsync(record2,{
                'Latest Date': each_date.toString()
            });
        } else if (latest_date < each_date){
            output.text("updating current_veg: " + curr_veg + " from " + latest_date + " to " + each_date);
            await t_curr_pref.updateRecordAsync(record2,{
                'Latest Date': each_date.toString()
            });
        }
    }
}
output.text("done!")
