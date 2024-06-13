<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="level-puzzle">
	<div class="level">
		<xsl:attribute name="style">
			--width: <xsl:value-of select="grid/@width"/>;
			--height: <xsl:value-of select="grid/@height"/>;
			<xsl:if test="grid/@cell">--cell: <xsl:value-of select="grid/@cell"/>px;</xsl:if>
			<xsl:if test="grid/@unit">--unit: <xsl:value-of select="grid/@unit"/>px;</xsl:if>
			<xsl:if test="grid/@gap">--gap: <xsl:value-of select="grid/@gap"/>px;</xsl:if>
			<xsl:if test="grid/@cW">--cW: <xsl:value-of select="grid/@cW"/>px;</xsl:if>
			<xsl:if test="grid/@cH">--cH: <xsl:value-of select="grid/@cH"/>px;</xsl:if>
			<xsl:for-each select="Palette/*[@key]">
				--<xsl:value-of select="@key"/>: <xsl:value-of select="@val"/>;
			</xsl:for-each>
		</xsl:attribute>

		<div class="puzzle">
			<div class="grid-base">
				<xsl:for-each select="grid/*">
					<span>
						<xsl:attribute name="class"><xsl:value-of select="@type"/></xsl:attribute>
						<xsl:attribute name="style">
							--x: <xsl:value-of select="@x"/>;
							--y: <xsl:value-of select="@y"/>;
							<xsl:if test="@c">--c: <xsl:value-of select="ancestor::Level/Palette/c[@id = current()/@c]/@val"/>;</xsl:if>
							<xsl:if test="@d">--d: <xsl:value-of select="@d"/>;</xsl:if>
						</xsl:attribute>
					</span>
				</xsl:for-each>
			</div>

			<div class="grid-extra"></div>
			<div class="grid-path">
				<svg><g></g></svg>
			</div>
			<div class="grid-error"></div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>