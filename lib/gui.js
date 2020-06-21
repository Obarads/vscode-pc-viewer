function addOtherGui(gui, params) {
    // For displaying gui slider, I have no idea why but 
    // I must first assign non-typescript value to max value.
    gui.add(params, 'pointSize').min(0).max(20).max(params.pointMaxSize);
    gui.addColor(params, "backgroundColor");
    gui.addColor(params, "pointColor");

}

function addGuiFolder(gui, folder_name, params) {
    var gui_folder = gui.addFolder(folder_name);
    for(var key in params){
        gui_folder.add(params, key)
    }
    return gui_folder
}
