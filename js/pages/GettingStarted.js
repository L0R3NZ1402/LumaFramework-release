Luma.View = Luma.View || {};

Luma.View.GettingStarted = function () {
    Luma.CreateElement({
        target: '#main-content',
        elements: [
            {
                element: 'div',
                class: 'd-flex justify-content-center align-items-center',
                style: 'height: 100vh;',
                content: [
                    {
                        element: 'div',
                        class: 'd-flex flex-column align-items-center',
                        content: [
                            {
                                element: 'h1',
                                class: 'text-uppercase fw-bold text-dark',
                                text: 'Getting Started!'
                            },
                            {
                                element: 'button',
                                class: 'btn btn-outline-dark btn-lg w-75 rounded-pill fw-bold',
                                click: () => startBtn(),
                                text: 'Start'
                            }
                        ]
                    }
                ]
            }
        ]
    });

    function startBtn() {
        Luma.Alert({
            alert: 'info',
            title: 'Getting Started',
            message: 'Start building your project now!'
        });
    }
}