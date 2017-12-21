const ViewModel = require('../view-model.js');

module.exports = class RecoveryQuestionsViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        return new RecoveryQuestionsViewModel();
    }

    render() {
        //add a q/a
        this.onAddQAClick({ data: this });
        //focus first input
        $('input:visible:first').focus().select();
        $('.button-add-qa').click(this, this.onAddQAClick);
        //footer buttons
        $('.button-cancel').click(this, this.onCancelClick);
    }

    onDeleteQAClick(e) {
        $(this).closest('tr').remove();
        let qaCount = $('table.list tbody tr').length;
        $('.button-add-qa').prop('disabled', (qaCount >= 12));
    }

    onAddQAClick(e) {
        let self = e.data;
        let qaCount = $('table.list tbody tr').length;
        if (qaCount < 12) {
            let html = `<tr>
                <td>
                <input type="text" placeholder="Enter: Question" maxlength="128" />
                <input type="text" placeholder="Enter: Answer" maxlength="896" />
                </td>
                <td class="text-right"><button class="button"><i class="fa fa-trash"></i></button></td>
            </tr>`;
            let tr = $(html);
            tr.find('button').click(self, self.onDeleteQAClick);
            $('table.list tbody').append(tr);
            window.scrollTo(0,document.body.scrollHeight);
            tr.find('input:first').focus();
            qaCount++;
        } 
        $('.button-add-qa').prop('disabled', (qaCount >= 12));
    }

    onCancelClick() {
        let mainWindow = require('electron').remote.getCurrentWindow();
        mainWindow.close();
    }

}