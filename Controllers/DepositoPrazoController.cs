using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AtivoPlusFrontend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepositoPrazoController : ControllerBase
    {
        // In-memory storage for testing purposes
        private static List<object> deposits = new List<object>
        {
            new {
                id = "1",
                ativoFinanceiroId = 1,
                bancoId = 2,
                titularId = "user1",
                numeroConta = "PT50000123456789",
                taxaJuroAnual = 4.2,
                valorAtual = 25875.00,
                valorInvestido = 25000.00,
                valorAnualDespesasEstimadas = 10.00,
                dataCriacao = DateTime.Now.AddMonths(-3)
            },
            new {
                id = "2",
                ativoFinanceiroId = 2,
                bancoId = 4,
                titularId = "user1",
                numeroConta = "PT50000987654321",
                taxaJuroAnual = 3.8,
                valorAtual = 31425.00,
                valorInvestido = 30000.00,
                valorAnualDespesasEstimadas = 15.50,
                dataCriacao = DateTime.Now.AddMonths(-12)
            },
            new {
                id = "3",
                ativoFinanceiroId = 1,
                bancoId = 3,
                titularId = "user1",
                numeroConta = "PT50000555555555",
                taxaJuroAnual = 3.5,
                valorAtual = 15175.00,
                valorInvestido = 15000.00,
                valorAnualDespesasEstimadas = 8.00,
                dataCriacao = DateTime.Now.AddMonths(-1)
            },
            new {
                id = "4",
                ativoFinanceiroId = 2,
                bancoId = 5,
                titularId = "user1",
                numeroConta = "PT50000444444444",
                taxaJuroAnual = 3.75,
                valorAtual = 5375.00,
                valorInvestido = 5000.00,
                valorAnualDespesasEstimadas = 5.00,
                dataCriacao = DateTime.Now.AddMonths(-28)
            }
        };

        [HttpGet("getAllByUser")]
        public async Task<IActionResult> GetAllByUser()
        {
            // Simulate API delay
            await Task.Delay(800);
            return Ok(deposits);
        }

        [HttpPost("adicionar")]
        public async Task<IActionResult> AddDeposito([FromBody] DepositoPrazoDTO deposito)
        {
            // Simulate API delay
            await Task.Delay(500);

            try
            {
                // Create a new deposit with ID
                var newDeposito = new
                {
                    id = Guid.NewGuid().ToString(),
                    ativoFinanceiroId = deposito.AtivoFinanceiroId,
                    bancoId = deposito.BancoId,
                    titularId = "user1", // Hardcoded for example
                    numeroConta = deposito.NumeroConta,
                    taxaJuroAnual = deposito.TaxaJuroAnual,
                    valorAtual = deposito.ValorInvestido, // Initially equals the invested amount
                    valorInvestido = deposito.ValorInvestido,
                    valorAnualDespesasEstimadas = deposito.ValorAnualDespesasEstimadas,
                    dataCriacao = deposito.DataCriacao
                };

                // Add to "database"
                deposits.Add(newDeposito);

                return Ok(new { id = newDeposito.id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("remover")]
        public async Task<IActionResult> RemoverDeposito([FromQuery] string id)
        {
            // Simulate API delay
            await Task.Delay(300);

            try
            {
                // Find the deposit by ID
                var deposit = deposits.FirstOrDefault(d =>
                {
                    var idProperty = d.GetType().GetProperty("id");
                    return idProperty?.GetValue(d)?.ToString() == id;
                });

                if (deposit == null)
                {
                    return NotFound(new { error = "Depósito não encontrado." });
                }

                // Remove from "database"
                deposits.Remove(deposit);

                return Ok(new { message = "Depósito eliminado com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // DTO for deposit creation
    public class DepositoPrazoDTO
    {
        public int UserId { get; set; }
        public int AtivoFinanceiroId { get; set; }
        public int BancoId { get; set; }
        public string NumeroConta { get; set; }
        public double TaxaJuroAnual { get; set; }
        public double ValorAtual { get; set; }
        public double ValorInvestido { get; set; }
        public double ValorAnualDespesasEstimadas { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}
