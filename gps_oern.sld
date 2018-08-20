<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se">
  <NamedLayer>
    <Name>gps_oern</Name>
    <UserStyle>
      <Name>gps_oern</Name>
      <FeatureTypeStyle>
        <Rule>
          <Name>1</Name>
          <Description>
            <Title>1</Title>
          </Description>
          <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>unit_id</ogc:PropertyName>
              <ogc:Literal>1</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <SvgParameter name="fill">#8eed93</SvgParameter>
                </Fill>
                <Stroke>
                  <SvgParameter name="stroke">#000000</SvgParameter>
                </Stroke>
              </Mark>
              <Size>24.59999999999994813</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        <Rule>
          <Name>2</Name>
          <Description>
            <Title>2</Title>
          </Description>
          <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>unit_id</ogc:PropertyName>
              <ogc:Literal>2</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <SvgParameter name="fill">#f087eb</SvgParameter>
                </Fill>
                <Stroke>
                  <SvgParameter name="stroke">#000000</SvgParameter>
                </Stroke>
              </Mark>
              <Size>7</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
