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
        this.addQARow(true, false);
        //focus first input
        $('input:visible:first').focus().select();
        $('.button-add-qa').click(this, this.onAddQAClick);
        //footer buttons
        $('.button-cancel').click(this, this.onCancelClick);
        $('.button-save').click(this, this.onSaveClick);
    }


    onDeleteQAClick(e) {
        $(this).closest('tr').remove();
        let qaCount = $('table.list tbody tr').length;
        $('.button-add-qa').prop('disabled', (qaCount >= 12));
    }

    onAddQAClick(e) {
        let self = e.data;
        self.addQARow(true, true);
    }

    onCancelClick(e) {
        let winref = require('electron').remote.getCurrentWindow();
        winref.close();
    }

    onSaveClick(e) {
        let winref = require('electron').remote.getCurrentWindow();
        let questions = [];
        let answers = [];
        $('table.list tr').each(function () {
            let q = $(this).find('.question').val();
            let a = $(this).find('.answer').val();
            if (q && a) {
                questions.push(q);
                answers.push(a);
            }
        });
        winref.window.saveQA(questions, answers);
        console.log(winref.window.wallet);
        //winref.close();
    }

    /**
     * Adds a new Q & A row to the table.
     * @param {Boolean} focus - If true, the new question input will be focused.
     * @param {Boolean} scroll - If true, the document will scroll to the newly inserted row
     */
    addQARow(focus, scroll) {
        let qaCount = $('table.list tbody tr').length;
        if (qaCount < 12) {
            let html = `<tr>
                <td><input type="text" class="question" placeholder="Enter: Question" maxlength="128" /></td>
                <td><input type="text" class="answer" placeholder="Enter: Answer" maxlength="896" /></td>
                <td class="text-right"><button class="button"><i class="fa fa-trash"></i></button></td>
            </tr>`;
            let tr = $(html);
            tr.find('button').click(this, this.onDeleteQAClick);
            $('table.list tbody').append(tr);
            if (scroll) {
                window.scrollTo(0, document.body.scrollHeight);
            }
            if (focus) {
                tr.find('input:first').focus();
            }
            qaCount++;
        }
        $('.button-add-qa').prop('disabled', (qaCount >= 12));
    }

}