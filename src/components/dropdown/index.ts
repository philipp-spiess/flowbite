/* eslint-disable @typescript-eslint/no-empty-function */
import { createPopper } from '@popperjs/core';
import type {
    Options as PopperOptions,
    Instance as PopperInstance,
} from '@popperjs/core';
import type { DropdownOptions } from './types';
import { DropdownInterface } from './interface';

const Default: DropdownOptions = {
    placement: 'bottom',
    triggerType: 'click',
    offsetSkidding: 0,
    offsetDistance: 10,
    onShow: () => {},
    onHide: () => {},
};

class Dropdown implements DropdownInterface {
    _targetEl: HTMLElement;
    _triggerEl: HTMLElement;
    _options: DropdownOptions;
    _visible: boolean;
    _popperInstance: PopperInstance;
    _clickOutsideEventListener: EventListenerOrEventListenerObject;

    constructor(
        targetElement: HTMLElement | null = null,
        triggerElement: HTMLElement | null = null,
        options: DropdownOptions = Default
    ) {
        this._targetEl = targetElement;
        this._triggerEl = triggerElement;
        this._options = { ...Default, ...options };
        this._popperInstance = this._createPopperInstance();
        this._visible = false;
        this._init();
    }

    _init() {
        if (this._triggerEl) {
            this._triggerEl.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    _createPopperInstance() {
        return createPopper(this._triggerEl, this._targetEl, {
            placement: this._options.placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [
                            this._options.offsetSkidding,
                            this._options.offsetDistance,
                        ],
                    },
                },
            ],
        });
    }

    _setupClickOutsideListener() {
        this._clickOutsideEventListener = (ev: MouseEvent) => {
            this._handleClickOutside(ev, this._targetEl);
        };
        document.body.addEventListener(
            'click',
            this._clickOutsideEventListener,
            true
        );
    }

    _removeClickOutsideListener() {
        document.body.removeEventListener(
            'click',
            this._clickOutsideEventListener,
            true
        );
    }

    _handleClickOutside(ev: Event, targetEl: HTMLElement) {
        const clickedEl = ev.target as Node;
        if (
            clickedEl !== targetEl &&
            !targetEl.contains(clickedEl) &&
            !this._triggerEl.contains(clickedEl) &&
            this._visible
        ) {
            this.hide();
        }
    }

    toggle() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this._targetEl.classList.remove('hidden');
        this._targetEl.classList.add('block');

        // Enable the event listeners
        this._popperInstance.setOptions((options: PopperOptions) => ({
            ...options,
            modifiers: [
                ...options.modifiers,
                { name: 'eventListeners', enabled: true },
            ],
        }));

        this._setupClickOutsideListener();

        // Update its position
        this._popperInstance.update();
        this._visible = true;

        // callback function
        this._options.onShow(this);
    }

    hide() {
        this._targetEl.classList.remove('block');
        this._targetEl.classList.add('hidden');

        // Disable the event listeners
        this._popperInstance.setOptions((options: PopperOptions) => ({
            ...options,
            modifiers: [
                ...options.modifiers,
                { name: 'eventListeners', enabled: false },
            ],
        }));

        this._visible = false;

        this._removeClickOutsideListener();

        // callback function
        this._options.onHide(this);
    }
}

if (typeof window !== 'undefined') {
    window.Dropdown = Dropdown;
}

export function initDropdowns() {
    document
        .querySelectorAll('[data-dropdown-toggle]')
        .forEach(($triggerEl) => {
            const dropdownId = $triggerEl.getAttribute('data-dropdown-toggle');
            const $dropdownEl = document.getElementById(dropdownId);

            if ($dropdownEl) {
                const placement = $triggerEl.getAttribute(
                    'data-dropdown-placement'
                );
                const offsetSkidding = $triggerEl.getAttribute(
                    'data-dropdown-offset-skidding'
                );
                const offsetDistance = $triggerEl.getAttribute(
                    'data-dropdown-offset-distance'
                );

                new Dropdown(
                    $dropdownEl as HTMLElement,
                    $triggerEl as HTMLElement,
                    {
                        placement: placement ? placement : Default.placement,
                        offsetSkidding: offsetSkidding
                            ? parseInt(offsetSkidding)
                            : Default.offsetSkidding,
                        offsetDistance: offsetDistance
                            ? parseInt(offsetDistance)
                            : Default.offsetDistance,
                    } as DropdownOptions
                );
            } else {
                console.error(
                    `The dropdown element with id "${dropdownId}" does not exist. Please check the data-dropdown-toggle attribute.`
                );
            }
        });
}

export default Dropdown;
