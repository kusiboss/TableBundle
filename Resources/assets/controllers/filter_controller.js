import { Controller } from '@hotwired/stimulus';
import { useTransition } from 'stimulus-use';

export default class extends Controller {
    static targets = ['filters', 'filterGroupList', 'singleFilterRemove', 'filterGroupFilterHeaderFirst', 'filterGroupFilterHeaderOthers', 'dropdown']

    connect() {
        /*
        useTransition(this, {
            element: this.filtersTarget,
            enterActive: 'ease-in-out duration-500',
            enterFrom: 'opacity-0',
            enterTo: 'opacity-100',
            leaveActive: 'ease-in-out duration-500',
            leaveFrom: 'opacity-100',
            leaveTo: 'opacity-0',
            hiddenClass: '',
            transitioned: false,
        });

        useTransition(this, {
            element: this.filtersTarget,
            enterActive: 'transform transition ease-in-out duration-500 sm:duration-700',
            enterFrom: 'translate-x-full',
            enterTo: 'translate-x-0',
            leaveActive: 'transform transition ease-in-out duration-500 sm:duration-700',
            leaveFrom: 'translate-x-0',
            leaveTo: 'translate-x-full',
            transitioned: false,
        });
        */

        this.updateGui();
    }

    filterTargetChanged (event) {
        const target = event.target;
        const parentBlock = target.parentElement.parentElement;
        const choosenOption = target.options[target.selectedIndex];
        const operatorSelect = parentBlock.querySelector('select[name^="index_filter_operator"]');
        const valueField = parentBlock.querySelector('[name^="index_filter_value"]');

        operatorSelect.options.length = 0;
        Object
            .entries(JSON.parse(choosenOption.getAttribute('data-operator-options')))
            .forEach(([key, value]) => {
                operatorSelect.add(new Option(value, key));
            })
        ;

        const parser = new DOMParser();
        const template = choosenOption.getAttribute('data-value-template')
        const doc = parser.parseFromString(template.replace(/{name}/g, valueField.getAttribute('name')), 'text/html');
        valueField.parentNode.replaceChild(doc.body, valueField);
    }

    /*
     * open filter panel
     */
    open() {
        this.filtersTarget.classList.remove('hidden');
    }

    /*
     * close filter panel
     */
    close() {
        this.filtersTarget.classList.add('hidden');
    }

    /*
     * clone AND filter and append it at the end
     */
    appendAnd(event) {
        // clone and reset all values
        let node = event.target.closest('[data-whatwedo--table-bundle--filter-target="singleFilter"]').cloneNode(true);
        this.resetInputs(node);

        const block = event.target.parentNode.parentNode.parentNode.parentNode;
        const lastSelectInBlock = block.querySelector('[data-whatwedo--table-bundle--filter-target="singleFilter"]:last-child select:first-child');

        const optionNameMatcher = /filter_([\w\d]+)\[(\d)\]\[(\d)\]/i;
        let blockNumber = 0;
        let iNumber = 0;
        if (optionNameMatcher.test(lastSelectInBlock.getAttribute('name'))) {
            const result = optionNameMatcher.exec(lastSelectInBlock.getAttribute('name'));
            const _blockNumber = parseInt(result[2]);
            if (!isNaN(_blockNumber)) {
                blockNumber = _blockNumber;
            }
            const _iNumber = parseInt(result[3]);
            if (!isNaN(_iNumber)) {
                iNumber = _iNumber + 1;
            }
        }
        node.querySelector('[name^="index_filter_column"]').name = 'index_filter_column['+blockNumber+']['+iNumber+']';
        node.querySelector('[name^="index_filter_operator"]').name = 'index_filter_operator['+blockNumber+']['+iNumber+']';
        node.querySelector('[name^="index_filter_value"]').name = 'index_filter_value['+blockNumber+']['+iNumber+']';

        event.target.closest('[data-whatwedo--table-bundle--filter-target="filterGroupFilterList"]').appendChild(node);

        this.updateGui();
    }

    /*
     * remove AND-filter
     */
    removeAnd(event) {
        let filter = event.target.closest('[data-whatwedo--table-bundle--filter-target="singleFilter"]');
        let filterGroup = filter.closest('[data-whatwedo--table-bundle--filter-target="filterGroup"]');

        event.target.closest('[data-whatwedo--table-bundle--filter-target="singleFilter"]').remove();

        // remove empty OR queries
        if (filterGroup.querySelectorAll('[data-whatwedo--table-bundle--filter-target="singleFilter"]').length === 0) {
            filterGroup.remove();
        }

        this.updateGui();
    }

    /*
     * clone AND filter and append it at the end
     */
    appendOr(event) {
        // clone, only keep one filter and reset all values
        let node = this.filterGroupListTarget.querySelector('[data-whatwedo--table-bundle--filter-target="filterGroup"]').cloneNode(true);
        node.querySelectorAll('[data-whatwedo--table-bundle--filter-target="singleFilter"]:not(:first-child)').forEach(element => element.remove());
        this.resetInputs(node);

        const allOfIt = event.target.parentNode.parentNode.parentNode;
        const lastBlockSelect = allOfIt.querySelector('[data-whatwedo--table-bundle--filter-target="filterGroup"]:last-child select:first-child');

        const optionNameMatcher = /filter_([\w\d]+)\[(\d)\]\[(\d)\]/i;
        let blockNumber = 0;
        if (optionNameMatcher.test(lastBlockSelect.getAttribute('name'))) {
            const result = optionNameMatcher.exec(lastBlockSelect.getAttribute('name'));
            const _blockNumber = parseInt(result[2]);
            if (!isNaN(_blockNumber)) {
                blockNumber = _blockNumber + 1;
            }
        }

        node.querySelector('[name^="index_filter_column"]').name = 'index_filter_column['+blockNumber+'][0]';
        node.querySelector('[name^="index_filter_operator"]').name = 'index_filter_operator['+blockNumber+'][0]';
        node.querySelector('[name^="index_filter_value"]').name = 'index_filter_value['+blockNumber+'][0]';

        this.filterGroupListTarget.appendChild(node);

        this.updateGui();
    }

    toggleDropdown() {
        if (this.dropdownTarget.classList.contains('hidden')) {
            this.dropdownTarget.classList.remove('hidden');
        } else {
            this.dropdownTarget.classList.add('hidden');
        }
    }

    /*
     * resets the content of newly added filters
     */
    resetInputs(node) {
        node.querySelectorAll('input').forEach(element => element.value = null);
        node.querySelectorAll('select').forEach(element => element.selectedIndex = 0);
    }

    /*
     * updates the gui state
     */
    updateGui() {
        // only show "and" in the last row
        this.filterGroupListTargets.forEach(function (filterGroupList) {
            filterGroupList.querySelectorAll('[data-whatwedo--table-bundle--filter-target="singleFilter"]')
                .forEach(e => e.querySelector('[data-whatwedo--table-bundle--filter-target="singleFilterAnd"]').classList.add('hidden'))
            filterGroupList.querySelectorAll('[data-whatwedo--table-bundle--filter-target="singleFilter"]:last-child')
                .forEach(e => e.querySelector('[data-whatwedo--table-bundle--filter-target="singleFilterAnd"]').classList.remove('hidden'))
        });

        // only show "trash" when there is more than one filter
        if (this.singleFilterRemoveTargets.length === 1) {
            this.singleFilterRemoveTarget.classList.add('invisible')
        } else {
            this.singleFilterRemoveTargets.forEach(element => element.classList.remove('invisible'))
        }

        // switch headers
        this.filterGroupFilterHeaderFirstTargets.forEach(element => element.classList.add('hidden'));
        this.filterGroupFilterHeaderOthersTargets.forEach(element => element.classList.remove('hidden'));

        if (this.filterGroupFilterHeaderFirstTargets.length > 0) {
            this.filterGroupFilterHeaderFirstTarget.classList.remove('hidden');
        }

        if (this.filterGroupFilterHeaderOthersTargets.length > 0) {
            this.filterGroupFilterHeaderOthersTarget.classList.add('hidden');
        }
    }

    reset(event) {
        document.querySelectorAll('[data-whatwedo--table-bundle--filter-target="filterGroup"]').forEach((element) => {
            element.remove();
        });
        event.target.closest('form').submit();
    }
}
