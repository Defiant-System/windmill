<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="level-puzzle">
	<div class="puzzle">
		<div class="grid-base">
			<xsl:for-each select="grid/*">
				<span>
					<xsl:attribute name="class"><xsl:value-of select="@o"/></xsl:attribute>
					<xsl:attribute name="style">
						--x: <xsl:value-of select="@x"/>;
						--y: <xsl:value-of select="@y"/>;
					</xsl:attribute>
				</span>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>