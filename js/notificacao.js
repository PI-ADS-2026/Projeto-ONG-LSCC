/* Sistema de notificações (Toast) */

(() => {
    // Injeta o CSS do Toast automaticamente
    const estilo = document.createElement("style");
    estilo.textContent = `
        #container-notificacoes {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 360px;
        }

        .toast-notificacao {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 8px;
            color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease forwards;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .toast-erro {
            background-color: #e53935;
            border-left: 5px solid #b71c1c;
        }

        .toast-sucesso {
            background-color: #2e7d32;
            border-left: 5px solid #1b5e20;
        }

        .toast-aviso {
            background-color: #ed6c02;
            border-left: 5px solid #e65100;
        }

        .toast-saindo {
            opacity: 0;
            transform: translateX(100%);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(estilo);

    // Cria o container na tela
    function obterContainer() {
        let container = document.getElementById("container-notificacoes");
        if (!container) {
            container = document.createElement("div");
            container.id = "container-notificacoes";
            document.body.appendChild(container);
        }
        return container;
    }

    // Função global para exibir a notificação
    window.mostrarNotificacao = function(mensagem, tipo = "erro", duracao = 6000) {
        const container = obterContainer();
        const toast = document.createElement("div");
        
        const icones = {
            erro: "⚠️",
            sucesso: "✅",
            aviso: "🔔"
        };

        toast.className = `toast-notificacao toast-${tipo}`;
        toast.innerHTML = `<span>${icones[tipo] || "⚠️"}</span><span>${mensagem}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-saindo");
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    };
})();