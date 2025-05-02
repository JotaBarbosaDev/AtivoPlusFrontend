var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços.
builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();

// Aqui crias o middleware que vai interceptar as chamadas para "/api"
app.MapWhen(
    context => context.Request.Path.StartsWithSegments("/api"),
    appBuilder =>
    {
        appBuilder.Run(async context =>
        {
            // Monta o URL de destino
            var targetUri = "https://es.maruqes.com:10513" + context.Request.Path + context.Request.QueryString;

            using var httpClient = new HttpClient(new HttpClientHandler
            {
                AllowAutoRedirect = false // tal como maxRedirects: 0
            });

            // Criação da mensagem de request para o servidor remoto
            var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUri);

            // Copia o conteúdo da request (se houver)
            if (context.Request.ContentLength.HasValue && context.Request.ContentLength.Value > 0)
            {
                requestMessage.Content = new StreamContent(context.Request.Body);
                if (!string.IsNullOrEmpty(context.Request.ContentType))
                {
                    requestMessage.Content.Headers.ContentType
                        = new System.Net.Http.Headers.MediaTypeHeaderValue(context.Request.ContentType);
                }
            }

            // Copia headers relevantes para a request
            foreach (var header in context.Request.Headers)
            {
                // Tenta meter no header da request HTTP; se não der, tenta meter no header do conteúdo
                if (!requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()))
                {
                    requestMessage.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            // Força o Host da request para o do servidor remoto
            requestMessage.Headers.Host = "es.maruqes.com";

            // Envia a request
            var responseMessage = await httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);

            // Copia o status code da resposta
            context.Response.StatusCode = (int)responseMessage.StatusCode;

            // Copia os headers da resposta
            foreach (var header in responseMessage.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
            foreach (var header in responseMessage.Content.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            // Remove o "transfer-encoding" para evitar problemas de streaming
            context.Response.Headers.Remove("transfer-encoding");

            // Define o ContentType
            if (responseMessage.Content.Headers.ContentType is not null)
            {
                context.Response.ContentType = responseMessage.Content.Headers.ContentType.ToString();
            }

            // Lê o stream da resposta e envia-o de volta para o cliente
            using var responseStream = await responseMessage.Content.ReadAsStreamAsync();
            await responseStream.CopyToAsync(context.Response.Body);
        });
    }
);

// Mapeamento estático e Razor Pages
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

app.Run();
