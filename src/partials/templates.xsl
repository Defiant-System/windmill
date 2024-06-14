<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="level-puzzle">

	<xsl:variable name="puzzleWidth" select="(grid/@width * grid/@gW) + grid/@line" />
	<xsl:variable name="puzzleHeight" select="(grid/@height * grid/@gH) + grid/@line" />

	<div class="level">
		<xsl:attribute name="style">
			--width: <xsl:value-of select="grid/@width"/>;
			--height: <xsl:value-of select="grid/@height"/>;
			<xsl:if test="grid/@line">--line: <xsl:value-of select="grid/@line"/>px;</xsl:if>
			<xsl:if test="grid/@gap">--gap: <xsl:value-of select="grid/@gap"/>px;</xsl:if>
			<xsl:if test="grid/@gW">--gW: <xsl:value-of select="grid/@gW"/>px;</xsl:if>
			<xsl:if test="grid/@gH">--gH: <xsl:value-of select="grid/@gH"/>px;</xsl:if>
			<xsl:if test="grid/@grid">
				--gW: <xsl:value-of select="grid/@grid"/>px;
				--gH: <xsl:value-of select="grid/@grid"/>px;
			</xsl:if>
			<xsl:for-each select="Palette/*[@key]">
				--<xsl:value-of select="@key"/>: <xsl:value-of select="@val"/>;
			</xsl:for-each>
		</xsl:attribute>

		<div class="puzzle">
			<xsl:attribute name="style">
				width: <xsl:value-of select="$puzzleWidth"/>px;
				height: <xsl:value-of select="$puzzleHeight"/>px;
			</xsl:attribute>
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
						<xsl:if test="@type = 'start'">
							<xsl:attribute name="data-click">init-snake</xsl:attribute>
						</xsl:if>
					</span>
				</xsl:for-each>
			</div>

			<div class="grid-extra"></div>
			<div class="grid-path">
				<svg>
					<xsl:attribute name="width"><xsl:value-of select="$puzzleWidth"/></xsl:attribute>
					<xsl:attribute name="height"><xsl:value-of select="$puzzleHeight"/></xsl:attribute>
					<g transform="translate(9,9)"></g>
				</svg>
			</div>
			<div class="grid-error"></div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>