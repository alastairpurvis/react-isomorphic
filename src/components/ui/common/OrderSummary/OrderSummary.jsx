import React, { Component, PropTypes as pt } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OrderSummary.scss';
import Section from '../Section';
import Separator from '../Separator';
import cx from 'classnames';
import watchStores from '../../../../utils/decorators/watchStores';
import { formatPrice } from '../../../../utils/money';

@withStyles(s)
@watchStores('cart')
class OrderSummary extends Component {
    static contextTypes = {
        getStore: pt.func.isRequired
    };

    getStoresState() {
        const { currency, total } = this.context.getStore('cart').getState();

        return { currency, total };
    }

    render() {
        const { currency, total } = this.state;

        return (
            <Section
                className={s.orderSummary}
                hasBottomMargin={false}
            >
                <div className={s.orderItem}>
                    <span>Subtotal</span>
                    <span>{formatPrice(total, currency)}</span>
                </div>
                <div className={s.orderItem}>
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <Separator className={s.separator} />
                <div className={cx(s.total, s.orderItem)}>
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                </div>
            </Section>
        );
    }
}

export default OrderSummary;
