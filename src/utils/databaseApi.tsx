export const getAllOrders = async () => {
    try {
        const orders = await fetch('http://localhost:3000/api/orders/getAll');
        console.log('Successfully got orders');
        return orders.json()
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}

export const getAllOrdersByType = async (type: string) => {
    try {
        const orders = await fetch(`http://localhost:3000/api/orders/getAll/${type}`);
        console.log('Successfully got orders');
        return orders.json()
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}

export const getOrdersByAddress = async (offerer: string) => {
    try {
        const orders = await fetch('http://localhost:3000/api/orders/getByOfferer/' + offerer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        console.log('Successfully got orders');
        const ordersJson = await orders.json();
        console.log(ordersJson)
        return ordersJson
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}

export const deleteAllOrders = async (offerer: string) => {
    try {
        fetch('http://localhost:3000/api/orders/deleteAll', {
            method: 'DELETE',
            body: JSON.stringify({ offerer }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        console.log('Successfully got orders');
        return 'success';
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}


export const deleteOrders = async (ids: number[]) => {
    try {
        fetch('http://localhost:3000/api/orders/', {
            method: 'DELETE',
            body: JSON.stringify({ ids }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        console.log('Successfully got orders');
        return 'success';
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}

export const postOffer = async (data: any, type?: string) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data, type: type ? type : 'offer' })
    };
    try {
        await fetch('http://localhost:3000/api/orders/', requestOptions);
        console.log('Successfully posted order');
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}

export const postOrder = async (data: any) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data, type: 'order' })
    };
    try {
        await fetch('http://localhost:3000/api/orders/', requestOptions);
        console.log('Successfully posted order');
    } catch (e) {
        console.warn('An error occurred saving the order');
        return e;
    }
}