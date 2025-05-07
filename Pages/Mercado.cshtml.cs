using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AtivoPlusFrontend.Pages
{
    public class MercadoModel : PageModel
    {
        public required List<IndiceMercado> Indices { get; set; }

        public void OnGet()
        {
            // Dados mockados — no futuro isto vem de uma API
            Indices = new List<IndiceMercado>
            {
                new IndiceMercado { Nome = "S&P 500", Tipo = "Índice", Variacao = "+1.25%", Valor = "4.200,50", CorValor = "text-green-700 dark:text-green-400" },
                new IndiceMercado { Nome = "Dow Jones", Tipo = "Índice", Variacao = "-0.43%", Valor = "33.245,20", CorValor = "text-red-700 dark:text-red-400" },
                new IndiceMercado { Nome = "NASDAQ", Tipo = "Índice", Variacao = "+0.97%", Valor = "14.102,30", CorValor = "text-green-700 dark:text-green-400" },
                new IndiceMercado { Nome = "DAX", Tipo = "Índice Europeu", Variacao = "-1.12%", Valor = "15.789,60", CorValor = "text-red-700 dark:text-red-400" },
                new IndiceMercado { Nome = "IBEX 35", Tipo = "Índice Europeu", Variacao = "+0.35%", Valor = "9.432,80", CorValor = "text-green-700 dark:text-green-400" },
                new IndiceMercado { Nome = "FTSE 100", Tipo = "Índice UK", Variacao = "-0.15%", Valor = "7.910,00", CorValor = "text-red-700 dark:text-red-400" },
                new IndiceMercado { Nome = "Nikkei 225", Tipo = "Índice Asiático", Variacao = "+2.02%", Valor = "30.578,90", CorValor = "text-green-700 dark:text-green-400" },
                new IndiceMercado { Nome = "CAC 40", Tipo = "Índice Francês", Variacao = "-0.84%", Valor = "6.802,10", CorValor = "text-red-700 dark:text-red-400" }
            };
        }

        public class IndiceMercado
        {
            public required string Nome { get; set; }
            public required string Tipo { get; set; }
            public required string Variacao { get; set; }
            public required string Valor { get; set; }
            public required string CorValor { get; set; }
        }
    }
}
