<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<xsl:template name="game-progression">
	<ul data-click="select-world">
		<xsl:for-each select="./World">
		<li>
			<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
			<xsl:attribute name="data-solved"><xsl:value-of select="@solved"/></xsl:attribute>
			<xsl:if test="@state = 'active'">
				<xsl:attribute name="class">expanded</xsl:attribute>
			</xsl:if>
			<xsl:if test="@state = 'locked'">
				<xsl:attribute name="class">disabled</xsl:attribute>
			</xsl:if>
			<div class="progress"><span>
				<xsl:attribute name="style">
					width: <xsl:value-of select="@percent"/>
				</xsl:attribute>
			</span></div>
		</li>
		</xsl:for-each>
	</ul>
</xsl:template>


<xsl:template name="level-puzzle">
	<xsl:variable name="palette" select="ancestor::Data/Palette[@id = current()/@palette]" />
	<xsl:variable name="puzzleWidth" select="(grid/@width * grid/@gW) + grid/@line" />
	<xsl:variable name="puzzleHeight" select="(grid/@height * grid/@gH) + grid/@line" />

	<div class="level">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:attribute name="data-palette"><xsl:value-of select="@palette"/></xsl:attribute>
		<xsl:attribute name="data-symmetry"><xsl:value-of select="grid/@symmetry"/></xsl:attribute>
		<xsl:attribute name="style">
			--width: <xsl:value-of select="grid/@width"/>;
			--height: <xsl:value-of select="grid/@height"/>;
			<xsl:if test="grid/@line">--line: <xsl:value-of select="grid/@line"/>px;</xsl:if>
			<xsl:if test="grid/@gap">--gap: <xsl:value-of select="grid/@gap"/>px;</xsl:if>
			<xsl:if test="grid/@cM">--cM: <xsl:value-of select="grid/@cM"/>px;</xsl:if>
			<xsl:if test="grid/@gW">--gW: <xsl:value-of select="grid/@gW"/>px;</xsl:if>
			<xsl:if test="grid/@gH">--gH: <xsl:value-of select="grid/@gH"/>px;</xsl:if>
			<xsl:if test="grid/@grid">
				--gW: <xsl:value-of select="grid/@grid"/>px;
				--gH: <xsl:value-of select="grid/@grid"/>px;
			</xsl:if>
			<xsl:for-each select="$palette/*[@key]">
				--<xsl:value-of select="@key"/>: <xsl:value-of select="@val"/>;
			</xsl:for-each>
			<xsl:for-each select="$palette/*[@id]">
				--c<xsl:value-of select="@id"/>: <xsl:value-of select="@val"/>;
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
							<xsl:if test="@d">--d: <xsl:value-of select="@d"/>;</xsl:if>
							<xsl:if test="@c">--c: var( --c<xsl:value-of select="@c"/> );</xsl:if>
						</xsl:attribute>
						<xsl:if test="@c"><xsl:attribute name="data-c"><xsl:value-of select="@c"/></xsl:attribute></xsl:if>
						<xsl:if test="@type = 'start'">
							<xsl:attribute name="data-click">init-snake</xsl:attribute>
						</xsl:if>
						<xsl:if test="@hexTop = 1">
							<i class="hex top"></i>
						</xsl:if>
						<xsl:if test="@hexMid = 1">
							<i class="hex middle"></i>
						</xsl:if>
						<xsl:if test="@hexBot = 1">
							<i class="hex bottom"></i>
						</xsl:if>
					</span>
				</xsl:for-each>
			</div>

			<div class="grid-path">
				<svg>
					<xsl:attribute name="width"><xsl:value-of select="$puzzleWidth"/></xsl:attribute>
					<xsl:attribute name="height"><xsl:value-of select="$puzzleHeight"/></xsl:attribute>
					<g>
						<xsl:attribute name="transform">translate(<xsl:value-of select="floor( grid/@line * .5 )"/>,<xsl:value-of select="floor( grid/@line * .5 )"/>)</xsl:attribute>
					</g>
				</svg>
			</div>
			<!-- <div class="grid-error"></div> -->
		</div>
	</div>
</xsl:template>


<xsl:template name="puzzle-errors">
	<xsl:for-each select="./*">
		<span class="error">
			<xsl:attribute name="style">
				--x: <xsl:value-of select="@x"/>;
				--y: <xsl:value-of select="@y"/>;
			</xsl:attribute>
			<xsl:attribute name="data-type">
				<xsl:value-of select="@type"/>
			</xsl:attribute>

			<xsl:if test="@line"><xsl:attribute name="class"><xsl:value-of select="@line"/> error</xsl:attribute></xsl:if>

			<xsl:if test="@hc = 1">
				<xsl:attribute name="data-hexCorner">1</xsl:attribute>
			</xsl:if>
			<xsl:if test="@hm = 1">
				<xsl:attribute name="data-hexMiddle">1</xsl:attribute>
			</xsl:if>
			<xsl:if test="@hm = 1">
				<xsl:attribute name="data-hexMiddle">1</xsl:attribute>
			</xsl:if>
		</span>
	</xsl:for-each>
</xsl:template>


<xsl:template name="endpoint-compass">
	<div class="ends-compass hidden" data-area="edit" data-click="rotate-endpoint">
		<span data-no="0" class="n"></span>
		<span data-no="1" class="nw"></span>
		<span data-no="2" class="w"></span>
		<span data-no="3" class="ws"></span>
		<span data-no="4" class="s"></span>
		<span data-no="5" class="se"></span>
		<span data-no="6" class="e"></span>
		<span data-no="7" class="ne"></span>
	</div>
</xsl:template>

</xsl:stylesheet>