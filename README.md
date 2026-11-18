# RadarRio

Aplicação web estática/PWA para consultar equipamentos de fiscalização eletrônica no município do Rio de Janeiro, combinando a listagem SMTR/CET-Rio e o conjunto aberto Pardal, com origens identificadas separadamente.

## Estado desta entrega

- 883 CODCETs únicos extraídos das seções relevantes do PDF fornecido, datado de 23/10/2026.
- 579 códigos aparecem nas categorias de fiscalização de velocidade.
- 481 aparecem na categoria combinada "Avanço de Sinal Vermelho / Parada Sobre Faixa de Pedestre".
- 177 códigos aparecem em ambas as categorias.
- 883 registros SMTR continuam sem coordenadas próprias; nenhum ponto externo recebe CODCET por aproximação.
- Dois códigos têm limites de velocidade conflitantes no documento (80 e 100 km/h); o limite é deixado sem valor e o conflito é exibido.
- O cabeçalho da seção de semáforo/faixa combina dois tipos de fiscalização; a fonte não informa qual dos dois se aplica individualmente a cada registro.

A aplicação lista os 883 registros SMTR e integra os pontos geográficos Pardal após o filtro pelo limite municipal do IBGE. Busca, filtros, detalhes, GPS, agrupamento de marcadores e alertas usam identificadores distintos para não confundir os dois conjuntos.

## Executar localmente

Não abra `index.html` diretamente por `file://`, pois `fetch`, módulos e service worker exigem servidor HTTP.

Com Python instalado:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000/RadarRio/` se o servidor tiver sido iniciado na pasta que contém a pasta RadarRio, ou `http://localhost:8000/` se estiver dentro dela.

## Publicar no GitHub Pages

1. Crie um repositório público chamado `radarrio` no GitHub.
2. Extraia o ZIP e envie o conteúdo da pasta `RadarRio` para a raiz do repositório (o `index.html` deve ficar na raiz).
3. Faça commit e push para a branch `main`.
4. No GitHub, abra **Settings → Pages**.
5. Em **Build and deployment**, selecione **Deploy from a branch**.
6. Selecione `main` e `/ (root)`, depois **Save**.
7. Aguarde a publicação. O endereço costuma ser `https://SEU-USUARIO.github.io/radarrio/`.

Se o repositório tiver outro nome, não há necessidade de editar caminhos: os recursos usam caminhos relativos.

## Instalar no iPhone

1. Publique o site em HTTPS no GitHub Pages.
2. Abra o endereço no Safari do iPhone.
3. Toque em **Compartilhar**.
4. Escolha **Adicionar à Tela de Início**.
5. Confirme o nome RadarRio e adicione. No iOS 26, se aparecer a opção **Abrir como App da Web**, mantenha-a ativada.
6. Abra pelo ícone criado.

O iOS 26 permite adicionar sites à Tela de Início e abri-los como apps da web. Ainda assim, uma PWA não tem o modo nativo de localização em segundo plano (`UIBackgroundModes`/Core Location). O iOS pode suspender a execução quando o app vai para segundo plano ou a tela bloqueia. Não há garantia de GPS contínuo ou alertas sonoros/falados com o app fechado ou suspenso. Mantenha o app aberto e a tela ativa durante o uso de alertas.

## Coordenadas: fluxo seguro

1. Revise `data/radars.json`.
2. Opcionalmente execute `python scripts/geocode_osm.py` para obter sugestões de endereços no OpenStreetMap/Nominatim. O processo pode levar cerca de 16 minutos para 883 registros e respeita intervalo de 1,1 segundo.
3. Abra `data/geocode-candidates.csv` e confira os resultados individualmente com o endereço, número, sentido e pista.
4. Só depois da validação, preencha `latitude`, `longitude` e `location_confidence` (`approximate` ou `confirmed`) no JSON.
5. Execute `python scripts/validate_data.py`.
6. Não marque um resultado de geocodificação de endereço como `confirmed` apenas porque o geocoder retornou uma coordenada.

A política do Nominatim deve ser consultada antes de usar o serviço: https://operations.osmfoundation.org/policies/nominatim/

## Funcionalidades

- Leaflet + OpenStreetMap.
- Pesquisa textual por endereço e CODCET.
- Filtros de velocidade e sinal/faixa.
- Lista dos registros oficiais SMTR, inclusive os sem coordenadas, e dos pontos Pardal filtrados para o município.
- Cartão de detalhes por equipamento.
- Geolocalização por `watchPosition`, quando autorizada.
- Velocidade GPS apenas quando fornecida pelo navegador.
- Distância até o equipamento mais próximo; para `SECTION`, distância calculada até o segmento.
- Alertas sonoros e falados em pt-BR, quando suportados e com a página ativa.
- PWA com manifest, ícone e service worker.

## Testes

Execute:

```bash
python scripts/validate_data.py
```

Esse validador confere identificadores, duplicidades, categorias, endereços e coordenadas. O GPS físico, permissões do iPhone e publicação GitHub Pages precisam ser testados em dispositivos/contas reais.

## Geospatial data request

The exact 23/10/2026 CET-Rio list is publicly available at https://cetrio.prefeitura.rio/wp-content/uploads/sites/36/2026/10/2026-10-23-ListagemSMTR.pdf. The IPEM-RJ verified-radar dataset is auxiliary only; its 2025 resource describes spatial granularity at neighborhood level, not exact equipment coordinates. See `docs/SOLICITACAO_COORDENADAS_CETRIO.md` for a prepared formal request to CET-Rio.


## Integração Pardal (18/11/2026)

O arquivo fornecido `radares.geojson` foi importado sem alterar as coordenadas para `data/pardal-rj.geojson`. Auditoria bruta: 1.199 feições (997 `FIXED`, 198 `RED_LIGHT`, 4 `SECTION`), sem coordenadas inválidas e sem duplicidades exatas. 1.159 aparecem como ativos e 40 como inativos segundo o campo `active` da fonte.

A aplicação carrega o limite municipal pela API de Malhas do IBGE para o município `3304557` e executa ponto-no-polígono. Não usa bairro, texto de endereço ou bounding box. Se a API falhar e não houver um arquivo local `data/limite_rio_ibge.geojson`, os pontos Pardal não são exibidos. O total filtrado aparece na interface após o polígono ser carregado. A contagem municipal não foi pré-calculada nesta entrega porque o ambiente de edição não conseguiu consultar o endpoint do IBGE.

**CODCET:** o GeoJSON Pardal não contém endereço nem CODCET. Não existe base suficiente para cruzar automaticamente cada ponto com os 883 endereços SMTR. Todos os pontos Pardal são exibidos sem CODCET associado; os 883 registros oficiais permanecem intactos e sem coordenadas.

`SECTION` é desenhado como linha entre `geometry.coordinates` e `properties.end`. Os marcadores são agrupados em zooms baixos e se separam/espalham em zooms altos. Registros `active=false` aparecem visualmente atenuados e não geram alertas.

### Origem e licença

O projeto Pardal informa que a base combina dados oficiais de diferentes órgãos e OpenStreetMap, mas não é uma fonte oficial nem endossada pela CET-Rio. Os valores `source`, `active`, `limit_kmh` e `direction_deg` são preservados literalmente. Dados derivados do conjunto devem respeitar a ODbL 1.0 e atribuir © colaboradores do OpenStreetMap, além das fontes descritas pelo Pardal. Consulte `data/pardal-audit.json` e https://github.com/Murkiriel/pardal.

A listagem SMTR/CET-Rio continua sendo a fonte dos CODCETs, endereços e horários oficiais. Não copiamos esses campos para pontos sem correspondência comprovada.
