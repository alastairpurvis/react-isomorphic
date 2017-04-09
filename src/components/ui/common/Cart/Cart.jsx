import React, { Component, PropTypes as pt } from 'react';
import Button from '../../common/Button';
import s from './Cart.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import watchStores from '../../../../utils/decorators/watchStores';
import { routes } from '../../../../config';
import cx from 'classnames';
import Row from '../Row';
import Column from '../Column';
import Separator from '../../common/Separator';
import CartProduct from '../../common/CartProduct';
import Price from '../../common/Price';
import Trashcan from '../../common/Icon/Icons/Trashcan.jsx';
import { SIZE_SMALL } from '../../../../constants/icon';
import { isEmpty } from 'lodash';
import OrderSummary from '../OrderSummary';
import CartProductQuantity from '../../common/CartProductQuantity';


@withStyles(s)
@watchStores(
    'user',
    'cart',
    'navigation',
)
class Cart extends Component {
    static contextTypes = {
        getStore: pt.func.isRequired,
        executeAction: pt.func.isRequired
    };

    static propTypes = {
        cartLoaded: pt.bool,
        cartId: pt.string,
        products: pt.array
    };

    getStoresState() {
        const
            { products, cartId, cartLoaded } = this.context.getStore('cart').getState();

        return {
            cartId,
            products,
            cartLoaded,
        };
    }

    handleRemoveFromCart = product => {
        const { cartId } = this.context.getStore('cart').getState();

        this.context.executeAction('cart/removeProduct', {
            id: cartId,
            productId: product.id
        });
    };

    render() {
        const
            { isLogged, products, cartLoaded, cartId } = this.state;

        if (isEmpty(products)) {
            if (cartLoaded) {
                return <div>The cart is empty.</div>;
            } else {
                return null;
            }
        }

        return (
            <Row>
            <Column hasRightMargin
                        alignItems='stretch'
                        flowDirection='bottom'
                        className={s.leftColumn}>
                <div className={cx(s.cartRow, s.headerRow)}>
                    <div className={s.productColumn}>Product</div>
                    <div className={s.quantityColumn}>Quantity</div>
                    <div className={s.priceColumn}>Price</div>
                    <div className={s.removeColumn}></div>
                </div>
                {products.map((cartItem, idx) =>
                    [
                        <div key={idx} className={s.cartRow}>
                            <CartProduct
                                className={s.productColumn}
                                item={cartItem}
                            />
                            <CartProductQuantity
                                className={s.quantityColumn}
                                quantity={cartItem.quantity}
                                maxQuantity={cartItem.product.stock_level}
                                cartActionParams={{
                                    cart_id: this.state.cartId,
                                    product_id: cartItem.product.id,
                                    variant_id: cartItem.variant.id
                                }}
                            />
                            <Price
                                className={s.priceColumn}
                                amount={cartItem.product.price}
                                discountPercentage={cartItem.product.discount}
                                currency={cartItem.product.currency}
                            />
                            <div className={s.removeColumn}>
                                <Trashcan
                                    size={SIZE_SMALL}
                                    className={s.removeIcon}
                                    onClick={this.handleRemoveFromCart.bind(this, cartItem)}
                                />
                            </div>
                        </div>,
                        <Separator />
                    ]
                )}
            </Column>
            <Column alignItems='stretch'
                        className={s.rightColumn}
                        flowDirection='bottom'
                        hasLeftMargin>
                <div className={s.orderForm}>
                    <OrderSummary />
                    <Button
                        wide
                        className={s.checkoutButton}
                        to={routes.CHECKOUT}
                    >
                        Proceed to checkout
                    </Button>
                </div>
            </Column>
            </Row>
        );
    }
}


export default Cart;
